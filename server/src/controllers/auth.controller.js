import { Otp } from "../models/otp.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  sendOtpEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
} from "../services/email.service.js";
import { User } from "../models/user.model.js";

const OTP_EXPIRY = 5 * 60 * 1000;
const OTP_COOLDOWN = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

const SAFE_USER_FIELDS =
  "-password -refreshToken -passwordResetToken -passwordResetTokenExpiry";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const normalizeEmail = (email) => email.trim().toLowerCase();

const respondUnauthenticatedSession = (res) =>
  res
    .status(200)
    .clearCookie("accessToken", clearCookieOptions)
    .clearCookie("refreshToken", clearCookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          authenticated: false,
          user: null,
        },
        "No active session.",
      ),
    );

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to generate authentication tokens.");
  }
};

const createAndSendRegistrationOtp = async (email) => {
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);

  await Otp.deleteMany({
    email,
    action: "registration",
  });

  const otpRecord = await Otp.create({
    email,
    otp: hashedOtp,
    action: "registration",
    expiresAt: new Date(Date.now() + OTP_EXPIRY),
    attempts: 0,
  });

  if (!isProduction) {
    console.log(`OTP for ${email}: ${otp}`);
  }

  try {
    await sendOtpEmail({ to: email, otp });
  } catch {
    await Otp.deleteOne({ _id: otpRecord._id }).catch(() => {});

    throw new ApiError(500, "Failed to send OTP email. Please try again.");
  }

  return otpRecord;
};

const register = asyncHandler(async (req, res) => {
  const { userName, fullName, mobileNo, password, email } = req.body;

  if (
    !isNonEmptyString(userName) ||
    !isNonEmptyString(fullName) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(password) ||
    !["string", "number"].includes(typeof mobileNo) ||
    !String(mobileNo).trim()
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  const normalizedUserName = userName.trim().toLowerCase();
  const normalizedEmail = normalizeEmail(email);
  const normalizedMobileNo = String(mobileNo).trim();

  const existingUser = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { userName: normalizedUserName },
      { mobileNo: normalizedMobileNo },
    ],
  });

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      throw new ApiError(409, "Email already exists.");
    }

    if (existingUser.userName === normalizedUserName) {
      throw new ApiError(409, "Username already exists.");
    }

    throw new ApiError(409, "Mobile number already exists.");
  }

  let user;

  try {
    user = await User.create({
      userName: normalizedUserName,
      fullName: fullName.trim(),
      password,
      email: normalizedEmail,
      mobileNo: normalizedMobileNo,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(
        409,
        "Email, username, or mobile number already exists.",
      );
    }

    throw error;
  }

  try {
    await createAndSendRegistrationOtp(normalizedEmail);
  } catch (error) {
    await Promise.allSettled([
      Otp.deleteMany({
        email: normalizedEmail,
        action: "registration",
      }),
      User.deleteOne({
        _id: user._id,
        isVerified: false,
      }),
    ]);

    throw error;
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        email: normalizedEmail,
      },
      "User registered successfully. Please verify your email.",
    ),
  );
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (
    !isNonEmptyString(email) ||
    (typeof otp !== "string" && typeof otp !== "number")
  ) {
    throw new ApiError(400, "Email and OTP are required.");
  }

  const normalizedEmail = normalizeEmail(email);
  const otpValue = String(otp);

  if (!/^\d{6}$/.test(otpValue)) {
    throw new ApiError(400, "Invalid OTP format.");
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found.");
  }

  if (existingUser.isVerified) {
    throw new ApiError(400, "User is already verified.");
  }

  const otpRecord = await Otp.findOne({
    email: normalizedEmail,
    action: "registration",
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new ApiError(400, "No OTP found. Please request a new OTP.");
  }

  if (
    !otpRecord.expiresAt ||
    new Date(otpRecord.expiresAt).getTime() <= Date.now()
  ) {
    throw new ApiError(400, "OTP has expired.");
  }

  if ((otpRecord.attempts ?? 0) >= MAX_OTP_ATTEMPTS) {
    throw new ApiError(429, "Too many invalid attempts.");
  }

  const isOtpValid = await bcrypt.compare(otpValue, otpRecord.otp);

  if (!isOtpValid) {
    const updatedOtp = await Otp.findOneAndUpdate(
      {
        _id: otpRecord._id,
        attempts: { $lt: MAX_OTP_ATTEMPTS },
      },
      {
        $inc: { attempts: 1 },
      },
      { new: true },
    );

    if (!updatedOtp) {
      throw new ApiError(429, "Too many invalid attempts.");
    }

    throw new ApiError(400, "Invalid OTP.");
  }

  const verifiedUser = await User.findOneAndUpdate(
    {
      _id: existingUser._id,
      isVerified: false,
    },
    {
      $set: { isVerified: true },
    },
    {
      returnDocument: "after",
    },
  );

  if (!verifiedUser) {
    throw new ApiError(400, "User is already verified.");
  }

  await Otp.deleteMany({
    email: normalizedEmail,
    action: "registration",
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    verifiedUser._id,
  );

  const safeUser = await User.findById(verifiedUser._id).select(
    SAFE_USER_FIELDS,
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          verified: true,
        },
        "User verified successfully.",
      ),
    );
});

const login = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  const lookupConditions = [];

  if (isNonEmptyString(userName)) {
    lookupConditions.push({
      userName: userName.trim().toLowerCase(),
    });
  }

  if (isNonEmptyString(email)) {
    lookupConditions.push({
      email: normalizeEmail(email),
    });
  }

  if (!lookupConditions.length) {
    throw new ApiError(400, "Username or email is required.");
  }

  if (!isNonEmptyString(password)) {
    throw new ApiError(400, "Password is required.");
  }

  const user = await User.findOne({
    $or: lookupConditions,
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid username/email or password.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid username/email or password.");
  }

  if (!user.isVerified) {
    const recentOtp = await Otp.findOne({
      email: user.email,
      action: "registration",
    }).sort({ createdAt: -1 });

    const recentCreatedAt = recentOtp?.createdAt
      ? new Date(recentOtp.createdAt).getTime()
      : 0;

    if (
      recentOtp &&
      Number.isFinite(recentCreatedAt) &&
      Date.now() - recentCreatedAt < OTP_COOLDOWN
    ) {
      return res.status(403).json(
        new ApiResponse(
          403,
          {
            requiresVerification: true,
            email: user.email,
          },
          "Account not verified. Please use the OTP already sent.",
        ),
      );
    }

    await createAndSendRegistrationOtp(user.email);

    return res.status(403).json(
      new ApiResponse(
        403,
        {
          requiresVerification: true,
          email: user.email,
        },
        "Account not verified. A new OTP has been sent.",
      ),
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const safeUser = await User.findById(user._id).select(SAFE_USER_FIELDS);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          verified: true,
        },
        "User logged in successfully.",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: {
        refreshToken: 1,
      },
    });
  }

  return res
    .status(200)
    .clearCookie("accessToken", clearCookieOptions)
    .clearCookie("refreshToken", clearCookieOptions)
    .json(new ApiResponse(200, {}, "User logged out."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing.");
  }

  let decoded;

  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }

  const user = await User.findById(decoded._id).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "User is not verified.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully."));
});

const getSession = asyncHandler(async (req, res) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    return respondUnauthenticatedSession(res);
  }

  let decodedAccessToken = null;

  if (accessToken) {
    try {
      decodedAccessToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
      );
    } catch {
      decodedAccessToken = null;
    }
  }

  if (decodedAccessToken) {
    const accessUser = await User.findById(decodedAccessToken._id).select(
      SAFE_USER_FIELDS,
    );

    if (accessUser?.isVerified) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            authenticated: true,
            user: accessUser,
          },
          "Session is valid.",
        ),
      );
    }
  }

  if (!refreshToken) {
    return respondUnauthenticatedSession(res);
  }

  let decodedRefreshToken;

  try {
    decodedRefreshToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch {
    return respondUnauthenticatedSession(res);
  }

  const user = await User.findById(decodedRefreshToken._id).select(
    "+refreshToken",
  );

  if (!user || refreshToken !== user.refreshToken || !user.isVerified) {
    return respondUnauthenticatedSession(res);
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const safeUser = await User.findById(user._id).select(SAFE_USER_FIELDS);

  if (!safeUser) {
    return respondUnauthenticatedSession(res);
  }

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          authenticated: true,
          user: safeUser,
        },
        "Session restored successfully.",
      ),
    );
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!isNonEmptyString(email)) {
    throw new ApiError(400, "Email is required.");
  }

  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.isVerified) {
    throw new ApiError(400, "User is already verified.");
  }

  const recentOtp = await Otp.findOne({
    email: normalizedEmail,
    action: "registration",
  }).sort({ createdAt: -1 });

  const recentCreatedAt = recentOtp?.createdAt
    ? new Date(recentOtp.createdAt).getTime()
    : 0;

  if (
    recentOtp &&
    Number.isFinite(recentCreatedAt) &&
    Date.now() - recentCreatedAt < OTP_COOLDOWN
  ) {
    throw new ApiError(
      429,
      "Please wait 60 seconds before requesting another OTP.",
    );
  }

  await createAndSendRegistrationOtp(normalizedEmail);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        email: normalizedEmail,
      },
      "OTP sent successfully.",
    ),
  );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!isNonEmptyString(email)) {
    throw new ApiError(400, "Email is required.");
  }

  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({
    email: normalizedEmail,
  });

  const genericMessage =
    "If an account with that email exists, a password reset link has been sent.";

  if (!user) {
    return res.status(200).json(new ApiResponse(200, null, genericMessage));
  }

  const existingExpiry = user.passwordResetTokenExpiry
    ? new Date(user.passwordResetTokenExpiry).getTime()
    : 0;

  if (
    user.passwordResetToken &&
    Number.isFinite(existingExpiry) &&
    existingExpiry > Date.now()
  ) {
    return res.status(200).json(new ApiResponse(200, null, genericMessage));
  }

  // RESET_PASSWORD_TOKEN_EXPIRY is measured in milliseconds.
  // Defaults to 15 minutes when the environment variable is not set.
  const resetTokenExpiryMs = Number(
    process.env.RESET_PASSWORD_TOKEN_EXPIRY ?? 15 * 60 * 1000,
  );

  if (!Number.isFinite(resetTokenExpiryMs) || resetTokenExpiryMs <= 0) {
    throw new ApiError(
      500,
      "Password reset token expiry is not configured correctly.",
    );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExpiry = new Date(Date.now() + resetTokenExpiryMs);

  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");

  if (!frontendUrl) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, "Frontend URL is not configured.");
  }

  const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail({
      to: user.email,
      resetLink,
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, "Failed to send password reset email.");
  }

  return res.status(200).json(new ApiResponse(200, null, genericMessage));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!isNonEmptyString(token)) {
    throw new ApiError(400, "Reset token is required.");
  }

  if (!isNonEmptyString(newPassword) || !isNonEmptyString(confirmPassword)) {
    throw new ApiError(400, "New password and confirm password are required.");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match.");
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!passwordRegex.test(newPassword)) {
    throw new ApiError(
      400,
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    );
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: { $gt: new Date() },
  }).select("+password");

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token.");
  }

  const isSamePassword = await user.isPasswordCorrect(newPassword);

  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password must be different from the current password.",
    );
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;
  user.refreshToken = undefined;

  await user.save();

  try {
    await sendPasswordChangedEmail({
      to: user.email,
    });
  } catch (error) {
    // The password is already changed. Do not report the reset as failed
    // solely because the notification email could not be delivered.
    console.error("Failed to send password changed email:", error);
  }

  return res
    .status(200)
    .clearCookie("accessToken", clearCookieOptions)
    .clearCookie("refreshToken", clearCookieOptions)
    .json(new ApiResponse(200, null, "Password reset successfully."));
});

export {
  register,
  verifyOtp,
  login,
  logout,
  refreshAccessToken,
  getSession,
  resendOtp,
  forgotPassword,
  resetPassword,
};

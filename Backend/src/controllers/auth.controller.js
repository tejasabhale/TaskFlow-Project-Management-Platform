import { Otp } from "../models/otp.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import {
  sendOtpEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
} from "../services/email.service.js";

const OTP_EXPIRY = 5 * 60 * 1000;
const OTP_COOLDOWN = 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to generate tokens",
    );
  }
};

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const register = asyncHandler(async (req, res) => {
  const { userName, fullName, mobileNo, password, email } = req.body;
  if (
    [userName, fullName, email, password].some((field) => !field?.trim()) ||
    !mobileNo?.toString()?.trim()
  ) {
    throw new ApiError(400, "All fields are required!");
  }
  const normalizedUserName = userName.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const existedUser = await User.findOne({
    $or: [
      { userName: normalizedUserName },
      { email: normalizedEmail },
      { mobileNo },
    ],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "User with same email, username, or mobile number already exists.",
    );
  }
  const user = await User.create({
    userName: normalizedUserName,
    fullName,
    password,
    email: normalizedEmail,
    mobileNo,
  });
  if (!user) {
    throw new ApiError(500, "Error while registering user");
  }

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  if (process.env.NODE_ENV !== "production") {
    console.log(`OTP for ${normalizedEmail} is ${otp}`);
  }

  sendOtpEmail({ to: user.email, otp });

  await Otp.deleteMany({
    email: normalizedEmail,
    action: "registration",
  });

  await Otp.create({
    email: normalizedEmail,
    otp: hashedOtp,
    action: "registration",
    expiresAt: new Date(Date.now() + OTP_EXPIRY),
  });
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        email,
      },
      "User registered successfully",
    ),
  );
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email?.trim() || !otp) {
    throw new ApiError(400, "Email and OTP are required!");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!/^\d{6}$/.test(otp.toString())) {
    throw new ApiError(400, "Invalid OTP format");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  if (existingUser.isVerified) {
    throw new ApiError(400, "User is already verified");
  }

  const otpRecord = await Otp.findOne({
    email: normalizedEmail,
    action: "registration",
  }).sort({
    createdAt: -1,
  });

  if (!otpRecord) {
    throw new ApiError(400, "No OTP found!");
  }
  if (otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, "OTP has expired");
  }

  if (otpRecord.attempts >= 5) {
    throw new ApiError(429, "Too many invalid attempts.");
  }

  const isOtpValid = await bcrypt.compare(otp.toString(), otpRecord.otp);

  if (!isOtpValid) {
    otpRecord.attempts++;
    await otpRecord.save();
    throw new ApiError(400, "Invalid OTP");
  }

  const user = await User.findOneAndUpdate(
    {
      email: normalizedEmail,
      isVerified: false,
    },
    {
      $set: { isVerified: true },
    },
    {
      returnDocument: "after",
    },
  );

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  await Otp.deleteMany({
    email: normalizedEmail,
    action: "registration",
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user,
          verified: true,
        },
        "User verified successfully.",
      ),
    );
});

const login = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!(userName?.trim() || email?.trim())) {
    throw new ApiError(400, "Username or Email is required");
  }

  if (!password?.trim()) {
    throw new ApiError(400, "Password is required");
  }

  const normalizedUserName = userName?.trim().toLowerCase();
  const normalizedEmail = email?.trim().toLowerCase();

  const user = await User.findOne({
    $or: [{ userName: normalizedUserName }, { email: normalizedEmail }],
  }).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your account first");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );
  const loggedInUser = await User.findById(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          verified: true,
        },
        "User logged in successfully",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    },
  });
  return res
    .status(200)
    .clearCookie("accessToken", clearCookieOptions)
    .clearCookie("refreshToken", clearCookieOptions)
    .json(new ApiResponse(200, {}, "User logged out."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
  const user = await User.findById(decoded._id).select("+refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }
  if (!user.isVerified) {
    throw new ApiError(403, "User is not verified");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully"));
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) {
    throw new ApiError(400, "Email is required.");
  }
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(404, "User not found, please register.");
  }
  if (user.isVerified) {
    throw new ApiError(400, "User is already verified.");
  }

  const recentOtp = await Otp.findOne({
    email: normalizedEmail,
    action: "registration",
  }).sort({ createdAt: -1 });

  if (recentOtp && Date.now() - recentOtp.createdAt.getTime() < OTP_COOLDOWN) {
    throw new ApiError(
      429,
      "Please wait 60 seconds before requesting another OTP.",
    );
  }

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  if (process.env.NODE_ENV !== "production") {
    console.log(`OTP for ${normalizedEmail} is ${otp}`);
  }
  await Otp.deleteMany({
    email: normalizedEmail,
    action: "registration",
  });

  await Otp.create({
    email: normalizedEmail,
    otp: hashedOtp,
    action: "registration",
    expiresAt: new Date(Date.now() + OTP_EXPIRY),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { email: normalizedEmail },
        "Otp sent successfully.",
      ),
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required.");
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "If an account with that email exists, a password reset link has been sent.",
        ),
      );
  }

  if (user.passwordResetToken && user.passwordResetTokenExpiry > Date.now()) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "If an account with that email exists, a password reset link has been sent.",
        ),
      );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExpiry =
    Date.now() + Number(process.env.RESET_PASSWORD_TOKEN_EXPIRY);

  await user.save({ validateBeforeSave: false });

  const resetLink = new URL(
    `/reset-password/${resetToken}`,
    process.env.FRONTEND_URL,
  ).toString();

  try {
    await sendPasswordResetEmail({ to: user.email, resetLink });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, "Failed to send password reset email.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "If an account with that email exists, a password reset link has been sent.",
      ),
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!token?.trim()) {
    throw new ApiError(400, "Reset token is required.");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token.");
  }

  if (!newPassword?.trim() || !confirmPassword?.trim()) {
    throw new ApiError(400, "New Password and Confirm Password are required.");
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
    console.error("Failed to send password changed email:", error);
  }

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "Password reset successfully."));
});

export {
  register,
  verifyOtp,
  login,
  logout,
  refreshAccessToken,
  resendOtp,
  forgotPassword,
  resetPassword,
};

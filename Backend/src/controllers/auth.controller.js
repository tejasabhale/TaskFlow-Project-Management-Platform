import { Otp } from "../models/otp.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

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

const register = asyncHandler(async (req, res) => {
  const { userName, fullName, mobileNo, password, email } = req.body;
  if (
    [userName, fullName, email, password].some(
      (field) => field?.trim() === "",
    ) ||
    !mobileNo
  ) {
    throw new ApiError(400, "All fields are required!");
  }
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }, { mobileNo }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with same email or username already exists!");
  }
  const user = await User.create({
    userName,
    fullName,
    password,
    email,
    mobileNo,
  });
  const createdUser = await User.findById(user._id);
  if (!createdUser) {
    throw new ApiError(500, "Error while registering user");
  }
  const generateOtp = () => {
    return crypto.randomInt(100000, 1000000).toString();
  };
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  console.log(`Otp for ${email} is ${otp}`);
  await Otp.create({
    email,
    otp: hashedOtp,
    action: "registration",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
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

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required!");
  }

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  if (existingUser.isVerified) {
    throw new ApiError(400, "User is already verified");
  }

  const otpRecord = await Otp.findOne({
    email,
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

  const isOtpValid = await bcrypt.compare(otp.toString(), otpRecord.otp);

  if (!isOtpValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  const user = await User.findOneAndUpdate(
    {
      email,
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
    email,
    action: "registration",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User Verified Sucessfully!"));
});

const login = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!(userName || email)) {
    throw new ApiError(400, "Username or Email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
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

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    },
  });
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
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

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully"));
});

export { register, verifyOtp, login, logout, refreshAccessToken };

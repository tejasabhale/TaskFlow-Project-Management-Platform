import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized request. Please log in.");
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }
  const user = await User.findById(decodedToken._id)
    .select("-password -refreshToken -passwordResetToken -passwordResetTokenExpiry")
    .lean();

  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your account first.");
  }

  req.user = user;
  next();
});

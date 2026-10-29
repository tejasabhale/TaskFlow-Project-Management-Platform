import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const PROFILE_FIELDS =
  "fullName userName email mobileNo avatar role isVerified createdAt updatedAt";

// Get the logged-in user's profile
const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required.");
  }

  const user = await User.findById(userId).select(PROFILE_FIELDS).lean();

  if (!user) {
    throw new ApiError(404, "User profile not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully."));
});

// Get any user's profile for authenticated users
const getUserProfileById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const user = await User.findById(userId).select(PROFILE_FIELDS).lean();

  if (!user) {
    throw new ApiError(404, "User profile not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Member details fetched successfully."));
});

export { getMyProfile, getUserProfileById };

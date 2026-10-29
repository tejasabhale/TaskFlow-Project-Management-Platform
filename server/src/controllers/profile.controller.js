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

// Update the logged-in user's profile
const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required.");
  }

  const { fullName, userName, mobileNo } = req.body;
  const updates = {};

  if (fullName !== undefined) {
    const value = String(fullName).trim();

    if (value.length < 2 || value.length > 100) {
      throw new ApiError(400, "Full name must be between 2 and 100 characters.");
    }

    updates.fullName = value;
  }

  if (userName !== undefined) {
    const value = String(userName).trim().toLowerCase();

    if (value.length < 3 || value.length > 30) {
      throw new ApiError(400, "Username must be between 3 and 30 characters.");
    }

    updates.userName = value;
  }

  if (mobileNo !== undefined) {
    const value = String(mobileNo).trim();

    if (!/^\d{10}$/.test(value)) {
      throw new ApiError(400, "Please enter a valid 10 digit mobile number.");
    }

    updates.mobileNo = value;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No changes provided.");
  }

  if (updates.userName) {
    const taken = await User.exists({
      userName: updates.userName,
      _id: { $ne: userId },
    });

    if (taken) throw new ApiError(409, "Username is already taken.");
  }

  if (updates.mobileNo) {
    const taken = await User.exists({
      mobileNo: updates.mobileNo,
      _id: { $ne: userId },
    });

    if (taken) throw new ApiError(409, "Mobile number is already in use.");
  }

  let user;

  try {
    user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true },
    )
      .select(PROFILE_FIELDS)
      .lean();
  } catch (error) {
    // Covers the race where another request took the value in between.
    if (error?.code === 11000) {
      throw new ApiError(409, "Username or mobile number is already in use.");
    }

    throw error;
  }

  if (!user) {
    throw new ApiError(404, "User profile not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully."));
});

export { getMyProfile, getUserProfileById, updateMyProfile };
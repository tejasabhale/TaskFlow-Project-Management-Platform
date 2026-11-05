import mongoose from "mongoose";
import fs from "fs";

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const PROFILE_FIELDS =
  "fullName userName email mobileNo avatar role isVerified createdAt updatedAt";

const removeTempFile = (filePath) => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Unable to remove temporary file:", error.message);
  }
};

// Get the logged-in user's profile.
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

// Get any user's profile for authenticated users.
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

// Update the logged-in user's profile, including their avatar.
const updateMyProfile = asyncHandler(async (req, res) => {
  const tempFilePath = req.file?.path;

  let uploadedAvatar = null;
  let avatarSaved = false;

  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, "Authentication required.");
    }

    const { fullName, userName, mobileNo } = req.body || {};

    const updates = {};

    if (fullName !== undefined) {
      const value = String(fullName).trim();

      if (value.length < 2 || value.length > 100) {
        throw new ApiError(
          400,
          "Full name must be between 2 and 100 characters.",
        );
      }

      updates.fullName = value;
    }

    if (userName !== undefined) {
      const value = String(userName).trim().toLowerCase();

      if (value.length < 3 || value.length > 30) {
        throw new ApiError(
          400,
          "Username must be between 3 and 30 characters.",
        );
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

    if (Object.keys(updates).length === 0 && !req.file) {
      throw new ApiError(400, "No changes provided.");
    }

    // Check whether the username is already being used.
    if (updates.userName) {
      const taken = await User.exists({
        userName: updates.userName,
        _id: { $ne: userId },
      });

      if (taken) {
        throw new ApiError(409, "Username is already taken.");
      }
    }

    // Check whether the mobile number is already being used.
    if (updates.mobileNo) {
      const taken = await User.exists({
        mobileNo: updates.mobileNo,
        _id: { $ne: userId },
      });

      if (taken) {
        throw new ApiError(409, "Mobile number is already in use.");
      }
    }

    const user = await User.findById(userId).select(PROFILE_FIELDS);

    if (!user) {
      throw new ApiError(404, "User profile not found.");
    }

    const oldAvatarPublicId = user.avatar?.publicId;

    // Upload the new avatar when a file is provided.
    if (req.file) {
      uploadedAvatar = await uploadOnCloudinary(
        req.file.path,
        "image",
        "TaskFlow/avatars",
      );

      if (!uploadedAvatar?.secure_url || !uploadedAvatar?.public_id) {
        throw new ApiError(502, "Unable to upload your profile image.");
      }

      user.avatar = {
        url: uploadedAvatar.secure_url,
        publicId: uploadedAvatar.public_id,
      };
    }

    user.set(updates);

    try {
      await user.save();
    } catch (error) {
      if (error?.code === 11000) {
        throw new ApiError(409, "Username or mobile number is already in use.");
      }

      throw error;
    }

    avatarSaved = Boolean(uploadedAvatar);

    // Delete the old Cloudinary avatar only after the new one is saved.
    if (
      uploadedAvatar &&
      oldAvatarPublicId &&
      oldAvatarPublicId !== uploadedAvatar.public_id
    ) {
      try {
        await deleteFromCloudinary(oldAvatarPublicId, "image");
      } catch (error) {
        // The profile update succeeded. A failed old-image deletion
        // should not make the client think the update failed.
        console.error("Unable to delete previous avatar:", error.message);
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, user.toObject(), "Profile updated successfully."),
      );
  } catch (error) {
    // Avoid leaving a newly uploaded image in Cloudinary if saving fails.
    if (uploadedAvatar?.public_id && !avatarSaved) {
      try {
        await deleteFromCloudinary(uploadedAvatar.public_id, "image");
      } catch (cleanupError) {
        console.error(
          "Unable to clean up uploaded avatar:",
          cleanupError.message,
        );
      }
    }

    if (error?.code === 11000) {
      throw new ApiError(409, "Username or mobile number is already in use.");
    }

    throw error;
  } finally {
    // Also handles validation errors that occur before Cloudinary upload.
    removeTempFile(tempFilePath);
  }
});

export { getMyProfile, getUserProfileById, updateMyProfile };

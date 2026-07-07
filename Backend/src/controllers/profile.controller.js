import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const clearCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload avatar.");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const oldPublicId = user.avatar.publicId;

  let uploadedFile;
  let updatedUser;

  try {
    uploadedFile = await uploadOnCloudinary(req.file.path);
    if (!uploadedFile) {
      throw new ApiError(500, "Avatar upload failed.");
    }

    updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatar: {
            url: uploadedFile.secure_url,
            publicId: uploadedFile.public_id,
          },
        },
      },
      {
        returnDocument: "after",
      },
    );
    if (!updatedUser) {
      throw new ApiError(500, "Failed to update avatar.");
    }
  } catch (error) {
    if (uploadedFile?.public_id) {
      await deleteFromCloudinary(uploadedFile.public_id);
    }
    throw error;
  }

  if (oldPublicId) {
    try {
      await deleteFromCloudinary(oldPublicId);
    } catch (err) {
      console.error("Failed to delete old avatar:", err);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully."));
});

const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  if (!user.avatar.publicId) {
    throw new ApiError(400, "No avatar to delete.");
  }
  await deleteFromCloudinary(user.avatar.publicId);
  user.avatar = {
    url: "",
    publicId: "",
  };
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar deleted successfully."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken",
  );
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully."));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { userName, fullName, mobileNo } = req.body;

  if (
    userName === undefined &&
    fullName === undefined &&
    mobileNo === undefined
  ) {
    throw new ApiError(400, "At least one field is required to update.");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (userName !== undefined) {
    if (!userName.trim()) {
      throw new ApiError(400, "Username cannot be empty.");
    }

    const normalizedUserName = userName.trim().toLowerCase();

    const existingUser = await User.findOne({
      userName: normalizedUserName,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      throw new ApiError(409, "Username is already taken.");
    }

    user.userName = normalizedUserName;
  }

  if (fullName !== undefined) {
    if (!fullName.trim()) {
      throw new ApiError(400, "Full name cannot be empty.");
    }

    user.fullName = fullName.trim();
  }

  if (mobileNo !== undefined) {
    const normalizedMobileNo = mobileNo.trim();

    if (!normalizedMobileNo) {
      throw new ApiError(400, "Mobile number cannot be empty.");
    }

    const existingUser = await User.findOne({
      mobileNo: normalizedMobileNo,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      throw new ApiError(409, "Mobile number is already in use.");
    }

    user.mobileNo = normalizedMobileNo;
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select(
    "-refreshToken -password",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(
      400,
      "Current password, new password and confirm password are required.",
    );
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match.");
  }

  if (currentPassword === newPassword) {
    throw new ApiError(
      400,
      "New password must be different from the current password.",
    );
  }

  const user = await User.findById(req.user._id).select(
    "+password",
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!passwordRegex.test(newPassword)) {
    throw new ApiError(
      400,
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    );
  }

  user.password = newPassword;
  user.refreshToken = undefined;

  await user.save();

  return res
    .status(200)
    .clearCookie("accessToken", clearCookieOptions)
    .clearCookie("refreshToken", clearCookieOptions)
    .json(new ApiResponse(200, null, "Password updated successfully."));
});

export {
  updateAvatar,
  deleteAvatar,
  getCurrentUser,
  updateProfile,
  changePassword,
};

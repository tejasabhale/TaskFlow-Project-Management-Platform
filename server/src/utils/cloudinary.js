import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const removeLocalFile = (filePath) => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Unable to remove temporary file:", error.message);
  }
};

const uploadOnCloudinary = async (
  localFilePath,
  resourceType = "image",
  folder = "TaskFlow/attachments",
) => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      folder,
    });

    return response;
  } finally {
    // Always remove the local temporary file.
    removeLocalFile(localFilePath);
  }
};

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) return null;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

export { uploadOnCloudinary, deleteFromCloudinary };

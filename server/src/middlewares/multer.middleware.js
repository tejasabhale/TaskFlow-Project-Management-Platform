import multer from "multer";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

import { ApiError } from "../utils/ApiError.js";

const uploadPath = path.resolve(process.cwd(), "public", "temp");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const extensions = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    const extension =
      extensions[file.mimetype] ||
      path.extname(file.originalname).toLowerCase();

    cb(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

const limits = {
  fileSize: 5 * 1024 * 1024,
};

// Keep this middleware for your existing general file uploads.
export const upload = multer({
  storage,
  limits,
});

// Use this middleware only for profile avatar uploads.
export const avatarUpload = multer({
  storage,
  limits,

  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new ApiError(400, "Avatar must be a JPG, PNG, or WebP image."));
    }

    cb(null, true);
  },
});

import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

import { ApiError } from "../utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.resolve(__dirname, "../../public/temp");

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
      "application/pdf": ".pdf",
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

const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
]);

// Keep this middleware for general task file attachments with safe type whitelist.
export const upload = multer({
  storage,
  limits,
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_ATTACHMENT_TYPES.has(file.mimetype)) {
      return cb(
        new ApiError(
          400,
          "File type not supported. Allowed formats: images (JPG, PNG, WebP, GIF), PDF, TXT, CSV, DOC, DOCX, XLS, XLSX, ZIP.",
        ),
      );
    }
    cb(null, true);
  },
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

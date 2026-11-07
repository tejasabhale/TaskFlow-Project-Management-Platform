import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const errorHandler = (err, req, res, next) => {
  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    err = new ApiError(400, "File size should not exceed 5 MB.");
  }

  // Handle malformed JSON body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Malformed JSON in request body."));
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          `Invalid format for ${err.path || "identifier"}.`,
        ),
      );
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Invalid authentication token."));
  }

  if (err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Authentication token has expired."));
  }

  // Handle CORS errors
  if (err.message && err.message.includes("CORS")) {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "Access denied by CORS policy."));
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json(
      new ApiResponse(
        400,
        null,
        Object.values(err.errors)
          .map((e) => e.message)
          .join(", "),
      ),
    );
  }

  // MongoDB duplicate key errors
  if (err.code === 11000) {
    // Label duplicate (workspace + name)
    if (err.keyPattern?.workspace && err.keyPattern?.name) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "Label already exists."));
    }

    // Generic duplicate key error
    const field = Object.keys(err.keyValue || {})[0];
    const value = err.keyValue?.[field];

    return res
      .status(409)
      .json(
        new ApiResponse(
          409,
          null,
          value
            ? `${field} '${value}' already exists.`
            : "Duplicate value already exists.",
        ),
      );
  }

  // Handle your custom ApiError
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, null, err.message));
  }

  // Log unexpected errors for debugging
  console.error(err);

  // Fallback for unexpected errors
  return res
    .status(500)
    .json(new ApiResponse(500, null, "Internal Server Error"));
};

export const errorHandler = (err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    err = new ApiError(400, "File size should not exceed 5 MB.");
  }

  res.status(err.statusCode || 500).json({
    success: err.success ?? false,
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    data: null,
  });
};
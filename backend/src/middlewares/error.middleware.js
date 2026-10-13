const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose invalid ObjectId
if (err.name === "CastError") {
  statusCode = 400;
  message = "Invalid task ID";
}


if (err.code === 11000) {
    statusCode = 409;
    message = "This record already exists";
}

if (err.name === "JsonWebTokenError") {
  statusCode = 401;
  message = "Invalid authentication token";
}

if (err.name === "TokenExpiredError") {
  statusCode = 401;
  message = "Authentication token has expired";
}

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;
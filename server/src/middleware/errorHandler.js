export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Something went wrong";

  if (process.env.NODE_ENV !== "test") {
    console.error(err);
    try {
      import("fs").then(fs => {
        fs.appendFileSync(
          "error_log.txt", 
          `\n\n[${new Date().toISOString()}] ${statusCode} ${message}\n${err.stack}\n`
        );
      });
    } catch(e) {}
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
}

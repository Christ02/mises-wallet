// Middlewares del backend

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
};


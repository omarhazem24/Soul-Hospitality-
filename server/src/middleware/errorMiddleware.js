import multer from 'multer';

export const errorHandler = (err, request, response, next) => {
  if (err instanceof multer.MulterError) {
    console.error('====================================');
    console.error('🔥 CRITICAL MULTER FIELD MISMATCH! 🔥');
    console.error(`Client sent a field named: "${err.field}"`);
    console.error(`Error Code: ${err.code}`);
    console.error('====================================');

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return response.status(400).json({
        success: false,
        message: "Multer configuration error: The multi-part file field key must be named exactly 'photos'."
      });
    }

    return response.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }

  if (err.name === 'Error' && err.message === 'Unsupported file type') {
    return response.status(400).json({
      success: false,
      message: 'Unsupported file type'
    });
  }

  const statusCode = err.statusCode || 500;

  return response.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};
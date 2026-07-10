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
        message: "Multer configuration error: unexpected file field. Use 'photos' for unit uploads and 'id_photos' for booking identity uploads."
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

  if (statusCode >= 500) {
    console.error('Unhandled server error', {
      message: err?.message,
      stack: err?.stack,
      path: request?.originalUrl,
      method: request?.method
    });
  }

  return response.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};
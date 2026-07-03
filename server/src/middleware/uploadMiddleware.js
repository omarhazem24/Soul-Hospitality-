import multer from 'multer';

const storage = multer.memoryStorage();
export const UNIT_PHOTO_FIELD_KEY = 'photos';

const createUpload = (options = {}) =>
  multer({
    storage,
    limits: {
      files: options.files || 10,
      fileSize: options.fileSize || 10 * 1024 * 1024
    },
    fileFilter: (request, file, callback) => {
      if (options.acceptMimeTypes && !options.acceptMimeTypes.includes(file.mimetype)) {
        callback(new Error('Unsupported file type'));
        return;
      }

      callback(null, true);
    }
  });

export const uploadReviewPhotos = createUpload({
  files: 4,
  fileSize: 5 * 1024 * 1024,
  acceptMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
});

export const uploadSingleImage = createUpload({
  files: 1,
  fileSize: 5 * 1024 * 1024,
  acceptMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
});

export const uploadMultipleImages = createUpload({
  files: 10,
  fileSize: 5 * 1024 * 1024,
  acceptMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
});

export const uploadResumePdf = createUpload({
  files: 1,
  fileSize: 10 * 1024 * 1024,
  acceptMimeTypes: ['application/pdf']
});
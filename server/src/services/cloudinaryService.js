import { cloudinary } from '../config/cloudinary.js';

export const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'soul-hospitality',
        resource_type: options.resourceType || 'image',
        public_id: options.publicId
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType
  });
};
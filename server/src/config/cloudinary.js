import { v2 as cloudinary } from 'cloudinary';

const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

const isConfigured = requiredEnvVars.every((key) => process.env[key]);

console.log('--- Cloudinary Key Verification ---');
console.log('Cloud Name Exists:', !!process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key Exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('API Secret Exists:', !!process.env.CLOUDINARY_API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export { cloudinary };
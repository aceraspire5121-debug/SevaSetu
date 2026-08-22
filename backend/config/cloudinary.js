const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload Base64 Data URL or File Buffer to Cloudinary
 * @param {string} fileData - Base64 string (data:image/...) or HTTPS URL
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<string>} - Cloudinary Secure HTTPS URL
 */
const uploadToCloudinary = async (fileData, folder = 'sevasetu') => {
  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error.message);
    throw new Error('Cloudinary Upload Failed: ' + error.message);
  }
};

module.exports = { cloudinary, uploadToCloudinary };

const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Upload image/file to Cloudinary CDN
// @route   POST /api/upload
// @access  Public
exports.uploadImage = async (req, res, next) => {
  try {
    const { image, folder } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'Please provide an image payload' });
    }

    console.log(`Uploading file to Cloudinary CDN (Folder: ${folder || 'sevasetu'})...`);
    const secureUrl = await uploadToCloudinary(image, folder || 'sevasetu');
    console.log(`✅ Cloudinary Upload Success: ${secureUrl}`);

    res.status(200).json({
      success: true,
      url: secureUrl,
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Image upload to Cloudinary failed',
    });
  }
};

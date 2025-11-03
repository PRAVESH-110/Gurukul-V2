const cloudinary = require('cloudinary').v2;

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary environment variables. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads a video to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The original file name
 * @param {string} folder - The folder to upload to (default: gurukul/videos)
 * @returns {Promise<Object>} - The upload result from Cloudinary
 */
const uploadVideo = async (fileBuffer, fileName, folder = process.env.CLOUDINARY_VIDEO_FOLDER) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'video',
      folder: folder,
      public_id: fileName.replace(/\.[^/.]+$/, ''), // Remove file extension
      chunk_size: 6000000, // 6MB chunks for better reliability
      eager: [
        { width: 300, height: 300, crop: 'pad', audio_codec: 'none' }, // Thumbnail
        { streaming_profile: 'hd' } // Streaming profile
      ],
      eager_async: true
    };

    // Only add notification URL if API_BASE_URL is set
    if (process.env.API_BASE_URL) {
      uploadOptions.eager_notification_url = `${process.env.API_BASE_URL}/api/webhooks/cloudinary`;
    } else {
      console.warn('API_BASE_URL is not set. Eager transformations will not trigger webhook notifications.');
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    // Create a buffer stream and pipe to Cloudinary
    const { Readable } = require('stream');
    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Deletes a video from Cloudinary
 * @param {string} publicId - The public ID of the video to delete
 * @returns {Promise<Object>} - The deletion result from Cloudinary
 */
const deleteVideo = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: 'video' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

module.exports = {
  cloudinary,
  uploadVideo,
  deleteVideo
};

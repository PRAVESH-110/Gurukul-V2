require('dotenv').config();
const ImageKit = require('imagekit');
const fs = require('fs');

// Initialize ImageKit instance from environment variables
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Uploads a local file or buffer to ImageKit
 * @param {Object} options
 * @param {string|Buffer} options.file - File path string, buffer, or base64 string
 * @param {string} options.fileName - Destination filename
 * @param {string} [options.folder] - Folder path in ImageKit (e.g. 'gurukul/images')
 * @param {Array<string>} [options.tags] - Optional tags
 * @returns {Promise<{ url: string, fileId: string, name: string, size: number, thumbnailUrl?: string }>}
 */
const uploadToImageKit = async ({
  file,
  fileName,
  folder = 'gurukul/images',
  tags = ['gurukul'],
}) => {
  return new Promise((resolve, reject) => {
    let filePayload = file;

    // If file is a path on disk, read it as buffer or base64
    if (typeof file === 'string' && fs.existsSync(file)) {
      filePayload = fs.readFileSync(file);
    }

    if (Buffer.isBuffer(filePayload)) {
      filePayload = filePayload.toString('base64');
    }

    imagekit.upload(
      {
        file: filePayload,
        fileName: fileName || `image-${Date.now()}`,
        folder,
        tags,
        useUniqueFileName: true,
      },
      (error, result) => {
        if (error) {
          console.error('❌ ImageKit upload error:', error);
          return reject(error);
        }
        console.log(`✅ ImageKit upload success: ${result.url}`);
        resolve(result);
      },
    );
  });
};

/**
 * Deletes a file from ImageKit by fileId
 * @param {string} fileId
 * @returns {Promise<any>}
 */
const deleteFromImageKit = async (fileId) => {
  if (!fileId) return;
  return new Promise((resolve, reject) => {
    imagekit.deleteFile(fileId, (error, result) => {
      if (error) {
        console.error(`❌ ImageKit delete error (${fileId}):`, error);
        return reject(error);
      }
      console.log(`🗑️ ImageKit deleted file (${fileId})`);
      resolve(result);
    });
  });
};

module.exports = {
  imagekit,
  uploadToImageKit,
  deleteFromImageKit,
};

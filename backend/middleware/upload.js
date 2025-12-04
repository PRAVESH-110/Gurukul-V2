const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Configure file type validation
const fileTypes = {
  image: {
    allowed: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxSize: 10 * 1024 * 1024, // 10MB
    error: 'Only images (JPEG, PNG, GIF, WebP, SVG) are allowed.'
  },
  video: {
    allowed: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    maxSize: 100 * 1024 * 1024, // 100MB
    error: 'Only videos (MP4, WebM, OGG, MOV) up to 100MB are allowed.'
  },
  document: {
    allowed: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    error: 'Only documents (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV) up to 10MB are allowed.'
  }
};

// Create storage configuration
const getStorage = (type = 'general') => {
  const uploadDir = path.join(__dirname, `../uploads/${type}`);

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${type}-${uniqueSuffix}${ext}`);
    }
  });
};

// Create file filter based on type
const createFileFilter = (type) => (req, file, cb) => {
  const config = fileTypes[type] || fileTypes.image;

  if (config.allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(config.error), false);
  }
};

// Create multer instances for different file types
const createUploader = (type) => {
  const config = fileTypes[type] || fileTypes.image;

  return multer({
    storage: getStorage(type),
    limits: {
      fileSize: config.maxSize,
      files: 1
    },
    fileFilter: createFileFilter(type)
  });
};

// Create specific upload middlewares
const upload = {
  // Single file uploads
  single: (field, type = 'image') => {
    const uploader = createUploader(type);
    return uploader.single(field);
  },

  // Multiple files upload
  array: (field, maxCount = 5, type = 'image') => {
    const uploader = createUploader(type);
    return uploader.array(field, maxCount);
  },

  // Fields upload
  fields: (fields, type = 'image') => {
    const uploader = createUploader(type);
    return uploader.fields(fields);
  },

  // Any file type
  any: () => {
    return multer({
      storage: getStorage('misc'),
      limits: { fileSize: 50 * 1024 * 1024 } // 50MB
    }).any();
  }
};

// Error handling middleware for multer
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    let status = 500;
    let message = 'An error occurred during file upload';

    if (err instanceof multer.MulterError) {
      status = 400;
      message = 'File upload error';

      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          message = 'File size exceeds the allowed limit';
          break;
        case 'LIMIT_FILE_COUNT':
          message = 'Too many files uploaded';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          message = 'Unexpected field in file upload';
          break;
      }
    } else if (err.message && Object.values(fileTypes).some(t => t.error === err.message)) {
      status = 400; // Bad request for invalid file types
      message = err.message;
    }

    return res.status(status).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  next();
};

// Helper function to delete a file
const deleteFile = (filePath) => {
  if (!filePath) return;

  const fullPath = path.join(__dirname, '../../', filePath);

  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error deleting file:', err);
    }
  });
};

// Clean up temp files on process exit
process.on('exit', () => {
  const tempDir = path.join(__dirname, '../../uploads/temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

module.exports = {
  upload,
  handleUploadErrors,
  deleteFile,
  fileTypes
};

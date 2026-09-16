const multer = require('multer');
const path = require('path');
const fs = require('fs');

// The stored file extension is derived from the (already whitelisted)
// MIME type, never from the client-supplied original filename — otherwise a
// "image/png" upload named "x.html" would be served back as HTML from
// /uploads.
const IMAGE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};
const VIDEO_EXTENSIONS = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

function safeFilename(mimetype, allowedExtensions) {
  const ext = allowedExtensions[mimetype] || '.bin';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Advertisement media: images + videos; stored in uploads/advertisements
const uploadDir = path.join(__dirname, '../../uploads/advertisements');
ensureDir(uploadDir);

const mediaExtensions = { ...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS };

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, safeFilename(file.mimetype, mediaExtensions)),
});

const fileFilter = (req, file, cb) => {
  if (Object.prototype.hasOwnProperty.call(mediaExtensions, file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Use image (JPEG, PNG, GIF, WebP) or video (MP4, WebM).'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Product images: JPEG, PNG, GIF, WebP only; stored in uploads/products
const productUploadDir = path.join(__dirname, '../../uploads/products');
ensureDir(productUploadDir);

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, productUploadDir),
  filename: (req, file, cb) => cb(null, safeFilename(file.mimetype, IMAGE_EXTENSIONS)),
});

const imageOnlyFilter = (req, file, cb) => {
  if (Object.prototype.hasOwnProperty.call(IMAGE_EXTENSIONS, file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Use JPEG, PNG, GIF or WebP.'), false);
  }
};

const productImageUpload = multer({
  storage: productStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = { upload, productImageUpload };

import fs from 'fs';
import path from 'path';
import multer from 'multer';

const EVENTS_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'events');

function ensureUploadDir() {
  if (!fs.existsSync(EVENTS_UPLOAD_DIR)) {
    fs.mkdirSync(EVENTS_UPLOAD_DIR, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, EVENTS_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${timestamp}-${random}${extension}`);
  }
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function fileFilter(_req, file, cb) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, png, webp, gif).'));
  }
}

export const eventImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export function buildEventImageUrl(filename) {
  if (!filename) return null;
  return `/uploads/events/${filename}`;
}


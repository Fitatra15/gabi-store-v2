import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images (JPEG, PNG, WebP, GIF) sont acceptées'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

const router = Router();

// Upload single image
router.post('/image', requireAuth, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucune image fournie' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename, size: req.file.size });
});

// Upload multiple images (max 5)
router.post('/images', requireAuth, requireAdmin, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Aucune image fournie' });
  const files = req.files.map(f => ({
    url: `/uploads/${f.filename}`,
    filename: f.filename,
    size: f.size,
  }));
  res.json({ files });
});

export default router;

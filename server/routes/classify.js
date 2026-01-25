import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import AliyunClassifier from '../utils/aliyun.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 配置 multer 存储
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片文件 (jpeg, jpg, png, gif, webp)'));
    }
  }
});

/**
 * 垃圾分类识别 API
 * POST /api/classify/rubbish
 * Body: multipart/form-data with 'image' field
 */
router.post('/rubbish', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    const filePath = req.file.path;
    console.log(`正在识别图片: ${filePath}`);

    try {
      const result = await AliyunClassifier.classifyRubbish(filePath);

      res.json({
        success: true,
        data: result.data,
        requestId: result.requestId
      });
    } finally {
      // 清理临时文件
      fs.unlink(filePath, (err) => {
        if (err) console.error('清理临时文件失败:', err);
      });
    }
  } catch (error) {
    console.error('垃圾分类识别失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '识别服务暂时不可用'
    });
  }
});

export default router;

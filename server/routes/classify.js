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
      // 1. 先进行垃圾分类识别（核心功能）
      const classifyResult = await AliyunClassifier.classifyRubbish(filePath);
      const elements = classifyResult.data.elements || [];
      
      // 2. 尝试进行目标检测和物品计数（增强功能，如果失败则降级）
      let objectCount = 1;
      let detectionDetails = [];
      
      try {
        // 同时调用目标检测和物品计数
        const [detectResult, countResult] = await Promise.allSettled([
          AliyunClassifier.detectObject(filePath),
          AliyunClassifier.countItem(filePath)
        ]);

        // 获取识别出的主要物品名称
        const mainRubbish = elements.length > 0 ? (elements[0].Rubbish || elements[0].rubbish || '') : '';

        // 1. 优先处理物品计数结果 (CountItem)
        if (countResult.status === 'fulfilled' && countResult.value && countResult.value.data) {
          const countData = countResult.value.data;
          console.log('CountItem data:', JSON.stringify(countData, null, 2));
          // CountItem 返回的数据中包含各种物品的数量
          // 如果主要识别物是瓶子，查找 countData 中的相关项
          if (mainRubbish && (mainRubbish.includes('瓶') || mainRubbish.includes('罐'))) {
            // CountItem 通常返回总数或者分类计数
            if (countData.count !== undefined) {
              objectCount = countData.count;
            }
          }
        }

        // 2. 如果物品计数没拿到理想结果，使用目标检测结果 (DetectObject)
        if (objectCount <= 1 && detectResult.status === 'fulfilled' && detectResult.value && detectResult.value.data && detectResult.value.data.elements) {
          detectionDetails = detectResult.value.data.elements;
          console.log('DetectObject elements:', JSON.stringify(detectionDetails, null, 2));
          
          if (mainRubbish) {
            const lowerMainRubbish = mainRubbish.toLowerCase();
            let targetTypes = [];
            
            if (lowerMainRubbish.includes('瓶') || lowerMainRubbish.includes('罐')) {
              targetTypes = ['bottle', 'cup', 'can'];
            } else if (lowerMainRubbish.includes('纸') || lowerMainRubbish.includes('盒')) {
              targetTypes = ['box', 'book'];
            } else if (lowerMainRubbish.includes('果') || lowerMainRubbish.includes('菜')) {
              targetTypes = ['banana', 'apple', 'orange', 'broccoli', 'carrot'];
            } else if (lowerMainRubbish.includes('电') || lowerMainRubbish.includes('池')) {
              targetTypes = ['cell phone', 'mouse', 'remote', 'keyboard'];
            }

            if (targetTypes.length > 0) {
              const matchedElements = detectionDetails.filter(el => 
                targetTypes.includes(el.type.toLowerCase()) && el.score > 0.3
              );
              
              if (matchedElements.length > 0) {
                objectCount = Math.max(objectCount, matchedElements.length);
                console.log(`智能识别出 ${objectCount} 个匹配物体: ${targetTypes.join(', ')}`);
              }
            } else {
              const validElements = detectionDetails.filter(el => 
                !['person', 'hand', 'face'].includes(el.type.toLowerCase()) && el.score > 0.4
              );
              objectCount = Math.max(objectCount, validElements.length);
            }
          }
        }
      } catch (enhanceError) {
        console.warn('增强识别功能执行异常:', enhanceError.message);
      }

      res.json({
        success: true,
        data: {
          sensitive: classifyResult.data.sensitive,
          elements: elements,
          objectCount: objectCount,
          detectionDetails: detectionDetails
        },
        requestId: classifyResult.requestId
      });
    } catch (apiError) {
      // 详细记录阿里云 API 错误
      console.error('=== 阿里云 API 调用失败 ===');
      console.error('错误名称:', apiError.name);
      console.error('错误代码:', apiError.code);
      console.error('错误消息:', apiError.message);
      if (apiError.data) {
        console.error('错误数据:', JSON.stringify(apiError.data, null, 2));
      }
      console.error('完整错误:', apiError);
      throw apiError;
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

import express from 'express';
import { Op } from 'sequelize';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要登录
router.use(authenticateToken);

// 获取未读通知数量（轮询用）
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.userId, isRead: false }
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('获取未读通知数失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取通知列表（分页）
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));
    const offset = (page - 1) * pageSize;

    const where = { userId: req.user.userId };
    if (req.query.isRead !== undefined) {
      where.isRead = req.query.isRead === 'true';
    }

    const { count: total, rows: list } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    res.json({
      success: true,
      data: {
        list,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取通知列表失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 标记单条通知已读
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: '通知不存在' });
    }
    if (notification.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: '无权操作' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, data: { id: notification.id, isRead: true } });
  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 全部标记已读
router.put('/read-all', async (req, res) => {
  try {
    const [affected] = await Notification.update(
      { isRead: true },
      { where: { userId: req.user.userId, isRead: false } }
    );

    res.json({ success: true, data: { affected } });
  } catch (error) {
    console.error('全部标记已读失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 删除通知
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: '通知不存在' });
    }
    if (notification.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: '无权操作' });
    }

    await notification.destroy();

    res.json({ success: true });
  } catch (error) {
    console.error('删除通知失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

export default router;

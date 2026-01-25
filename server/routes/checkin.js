import express from 'express';
import { Op } from 'sequelize';
import CheckinRecord from '../models/CheckinRecord.js';
import User from '../models/User.js';
import RecycleStation from '../models/RecycleStation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取今日打卡统计
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await CheckinRecord.findAll({
            where: {
                userId,
                createdAt: {
                    [Op.gte]: today
                }
            },
            attributes: ['points']
        });

        const count = stats.length;
        const totalPoints = stats.reduce((sum, record) => sum + record.points, 0);

        res.json({
            success: true,
            count,
            totalPoints
        });
    } catch (error) {
        console.error('获取统计失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 获取打卡历史
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        const history = await CheckinRecord.findAll({
            where: { userId },
            include: [{
                model: RecycleStation,
                as: 'station',
                attributes: ['name']
            }],
            order: [['createdAt', 'DESC']],
            limit
        });

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('获取历史失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 提交打卡记录
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { type, weight, points, imageUrl, stationId } = req.body;
        const userId = req.user.id;

        // 基础验证
        if (!type || points === undefined) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }

        // 1. 创建打卡记录
        const record = await CheckinRecord.create({
            userId,
            stationId: stationId || null,
            type,
            weight: weight || 0,
            points,
            checkinType: type.includes('AI') ? 'ai_recognition' : 'scan',
            imageUrl: imageUrl || '',
            status: 'approved' // 简化逻辑：直接通过
        });

        // 2. 更新用户积分
        const user = await User.findByPk(userId);
        if (user) {
            user.points = (user.points || 0) + points;
            await user.save();
        }

        res.json({
            success: true,
            message: '打卡成功',
            points: user.points,
            record
        });
    } catch (error) {
        console.error('打卡失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// ==================== 管理员 API ====================

// 获取审核统计数据
router.get('/admin/audit-stats', authenticateToken, async (req, res) => {
    try {
        // 验证是否是管理员
        const user = await User.findByPk(req.user.id);
        if (!user || (user.role !== 'recycle_admin' && user.role !== 'system_admin')) {
            return res.status(403).json({ success: false, message: '无权限访问' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 待审核数量
        const pending = await CheckinRecord.count({
            where: { status: 'pending' }
        });

        // 今日通过数量
        const approved = await CheckinRecord.count({
            where: {
                status: 'approved',
                updatedAt: { [Op.gte]: today }
            }
        });

        // 今日驳回数量
        const rejected = await CheckinRecord.count({
            where: {
                status: 'rejected',
                updatedAt: { [Op.gte]: today }
            }
        });

        res.json({
            success: true,
            data: { pending, approved, rejected }
        });
    } catch (error) {
        console.error('获取审核统计失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 获取待审核记录列表
router.get('/admin/pending', authenticateToken, async (req, res) => {
    try {
        // 验证是否是管理员
        const user = await User.findByPk(req.user.id);
        if (!user || (user.role !== 'recycle_admin' && user.role !== 'system_admin')) {
            return res.status(403).json({ success: false, message: '无权限访问' });
        }

        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const records = await CheckinRecord.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                },
                {
                    model: RecycleStation,
                    as: 'station',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        // 格式化返回数据
        const formattedRecords = records.map(record => ({
            id: record.id,
            user: record.user?.username || '未知用户',
            userId: record.user?.id,
            img: record.imageUrl || '',
            aiResult: `${record.type} ${record.weight}kg`,
            time: new Date(record.createdAt).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
            points: record.points,
            stationName: record.station?.name || '未知站点'
        }));

        res.json({
            success: true,
            data: formattedRecords
        });
    } catch (error) {
        console.error('获取待审核记录失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 通过审核
router.post('/admin/approve/:id', authenticateToken, async (req, res) => {
    try {
        // 验证是否是管理员
        const user = await User.findByPk(req.user.id);
        if (!user || (user.role !== 'recycle_admin' && user.role !== 'system_admin')) {
            return res.status(403).json({ success: false, message: '无权限访问' });
        }

        const recordId = req.params.id;
        const record = await CheckinRecord.findByPk(recordId);

        if (!record) {
            return res.status(404).json({ success: false, message: '记录不存在' });
        }

        if (record.status !== 'pending') {
            return res.status(400).json({ success: false, message: '该记录已被处理' });
        }

        // 更新状态为通过
        record.status = 'approved';
        await record.save();

        // 给用户加积分
        const targetUser = await User.findByPk(record.userId);
        if (targetUser) {
            targetUser.points = (targetUser.points || 0) + record.points;
            await targetUser.save();
        }

        res.json({
            success: true,
            message: '审核通过',
            data: { id: record.id, status: 'approved' }
        });
    } catch (error) {
        console.error('审核通过失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 驳回审核
router.post('/admin/reject/:id', authenticateToken, async (req, res) => {
    try {
        // 验证是否是管理员
        const user = await User.findByPk(req.user.id);
        if (!user || (user.role !== 'recycle_admin' && user.role !== 'system_admin')) {
            return res.status(403).json({ success: false, message: '无权限访问' });
        }

        const recordId = req.params.id;
        const { reason } = req.body; // 可选的驳回原因

        const record = await CheckinRecord.findByPk(recordId);

        if (!record) {
            return res.status(404).json({ success: false, message: '记录不存在' });
        }

        if (record.status !== 'pending') {
            return res.status(400).json({ success: false, message: '该记录已被处理' });
        }

        // 更新状态为驳回
        record.status = 'rejected';
        await record.save();

        res.json({
            success: true,
            message: '已驳回',
            data: { id: record.id, status: 'rejected', reason }
        });
    } catch (error) {
        console.error('驳回审核失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 获取所有回收站点列表（用于管理员选择）
router.get('/admin/stations', authenticateToken, async (req, res) => {
    try {
        // 验证是否是管理员
        const user = await User.findByPk(req.user.id);
        if (!user || (user.role !== 'recycle_admin' && user.role !== 'system_admin')) {
            return res.status(403).json({ success: false, message: '无权限访问' });
        }

        const stations = await RecycleStation.findAll({
            attributes: ['id', 'name', 'address', 'status'],
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: stations
        });
    } catch (error) {
        console.error('获取站点列表失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 生成站点二维码数据
router.post('/admin/generate-qr', authenticateToken, async (req, res) => {
    try {
        // 验证是否是管理员
        const user = await User.findByPk(req.user.id);
        if (!user || (user.role !== 'recycle_admin' && user.role !== 'system_admin')) {
            return res.status(403).json({ success: false, message: '无权限访问' });
        }

        const { stationId } = req.body;

        if (!stationId) {
            return res.status(400).json({ success: false, message: '请选择站点' });
        }

        const station = await RecycleStation.findByPk(stationId);
        if (!station) {
            return res.status(404).json({ success: false, message: '站点不存在' });
        }

        // 生成二维码内容（包含站点ID和一些验证信息）
        const qrData = JSON.stringify({
            type: 'pureocean_checkin',
            stationId: station.id,
            stationName: station.name,
            timestamp: Date.now()
        });

        // 使用第三方 API 生成二维码图片
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

        res.json({
            success: true,
            data: {
                qrCodeUrl,
                stationName: station.name,
                stationId: station.id
            }
        });
    } catch (error) {
        console.error('生成二维码失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 提交需要审核的打卡记录（AI识别结果）
router.post('/submit-for-review', authenticateToken, async (req, res) => {
    try {
        const { type, weight, points, imageUrl, stationId } = req.body;
        const userId = req.user.id;

        if (!type || points === undefined) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }

        // 创建待审核的打卡记录
        const record = await CheckinRecord.create({
            userId,
            stationId: stationId || null,
            type,
            weight: weight || 0,
            points,
            checkinType: 'ai_recognition',
            imageUrl: imageUrl || '',
            status: 'pending' // 待审核状态
        });

        res.json({
            success: true,
            message: '已提交审核',
            record
        });
    } catch (error) {
        console.error('提交审核失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

export default router;

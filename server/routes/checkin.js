import express from 'express';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import CheckinRecord from '../models/CheckinRecord.js';
import User from '../models/User.js';
import RecycleStation from '../models/RecycleStation.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保上传目录存在
const checkinImageDir = path.join(__dirname, '../uploads/checkin');
if (!fs.existsSync(checkinImageDir)) {
    fs.mkdirSync(checkinImageDir, { recursive: true });
}

/**
 * 保存 base64 图片到文件
 * @param {string} base64Data - base64 图片数据
 * @returns {string|null} - 文件路径或 null
 */
function saveBase64Image(base64Data) {
    if (!base64Data || !base64Data.startsWith('data:image/')) {
        return base64Data; // 如果不是 base64 图片，直接返回原值
    }

    try {
        // 解析 base64 数据
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) return null;

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');

        // 生成唯一文件名
        const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
        const filePath = path.join(checkinImageDir, filename);

        // 保存文件
        fs.writeFileSync(filePath, buffer);

        // 返回相对路径（用于服务端访问）
        return `/uploads/checkin/${filename}`;
    } catch (error) {
        console.error('保存图片失败:', error);
        return null;
    }
}

const router = express.Router();

// 获取今日打卡统计
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
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
        const userId = req.user.userId;
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

// 提交打卡记录（智能审核分流）
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { type, weight, points, imageUrl, stationId, confidence } = req.body;
        const userId = req.user.userId;

        console.log('=== 打卡请求 ===');
        console.log('req.user:', req.user);
        console.log('userId:', userId);
        console.log('请求体:', { type, weight, points, imageUrl, stationId, confidence });

        // 基础验证
        if (!type || points === undefined) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }

        if (!userId) {
            console.error('错误: userId 为空！');
            return res.status(401).json({ success: false, message: '用户未登录' });
        }

        // 智能审核分流逻辑
        const isAICheckin = type.includes('AI');
        let status = 'approved'; // 默认直接通过
        let reviewReason = null;

        if (isAICheckin) {
            const aiConfidence = confidence || 0;

            // 1. 置信度过低（<50%）-> 拒绝，提示重拍
            if (aiConfidence < 50) {
                return res.status(400).json({
                    success: false,
                    status: 'rejected',
                    message: '识别置信度过低，请重新拍照'
                });
            }

            // 2. 检查是否是首次回收用户
            const previousCheckinCount = await CheckinRecord.count({
                where: { userId, status: 'approved' }
            });

            if (previousCheckinCount === 0) {
                status = 'pending';
                reviewReason = '首次回收用户，需人工审核';
                console.log('首次用户AI打卡，进入审核队列');
            }

            // 3. 检查当日AI打卡次数（超过5次需审核）
            if (status === 'approved') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const todayAICount = await CheckinRecord.count({
                    where: {
                        userId,
                        checkinType: 'ai_recognition',
                        createdAt: { [Op.gte]: today }
                    }
                });

                if (todayAICount >= 5) {
                    status = 'pending';
                    reviewReason = '当日AI打卡超过5次，需人工审核';
                    console.log('当日AI打卡超限，进入审核队列');
                }
            }

            // 4. 中等置信度（50-79%）-> 需审核
            if (status === 'approved' && aiConfidence < 80) {
                status = 'pending';
                reviewReason = `AI置信度为${aiConfidence}%，需人工确认`;
                console.log('中等置信度，进入审核队列');
            }

            // 5. 高置信度（≥80%）-> 直接通过（已是默认状态）
        }
        // 扫码打卡 -> 直接通过（默认状态）

        console.log(`审核分流结果: status=${status}, reason=${reviewReason}`);

        // 1. 处理图片 - 将 base64 保存为文件
        const savedImageUrl = imageUrl ? saveBase64Image(imageUrl) : '';
        console.log('图片保存结果:', savedImageUrl ? '成功' : '无图片');

        // 2. 创建打卡记录
        const record = await CheckinRecord.create({
            userId,
            stationId: stationId || null,
            type,
            weight: weight || 0,
            points,
            checkinType: isAICheckin ? 'ai_recognition' : 'scan',
            imageUrl: savedImageUrl || '',
            status
        });

        console.log('打卡记录创建成功:', record.id, 'status:', status);

        let userPoints = 0;
        let taskBonusPoints = 0;

        // 3. 只有直接通过的才立即给用户加积分
        if (status === 'approved') {
            const user = await User.findByPk(userId);
            if (user) {
                user.points = (user.points || 0) + points;

                // 检查是否是首次回收，奖励任务积分
                const previousApprovedCount = await CheckinRecord.count({
                    where: {
                        userId,
                        status: 'approved',
                        id: { [Op.ne]: record.id }
                    }
                });

                if (previousApprovedCount === 0) {
                    taskBonusPoints = 50;
                    user.points += taskBonusPoints;
                    console.log('首次回收奖励任务积分:', taskBonusPoints);
                }

                await user.save();
                userPoints = user.points;
                console.log('用户积分更新成功:', userPoints);
            }
        }

        // 构建响应
        const response = {
            success: true,
            status,
            message: status === 'approved' ? '打卡成功' : '已提交审核，通过后将获得积分',
            points: status === 'approved' ? userPoints : 0,
            pendingPoints: status === 'pending' ? points : 0,
            record: {
                id: record.id,
                status: record.status,
                points: record.points
            }
        };

        if (reviewReason) {
            response.reviewReason = reviewReason;
        }

        res.json(response);
    } catch (error) {
        console.error('打卡失败 - 详细错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// ==================== 管理员 API ====================

// 获取审核统计数据
router.get('/admin/audit-stats', authenticateToken, async (req, res) => {
    try {
        // 验证是否是管理员
        const user = await User.findByPk(req.user.userId);
        if (!user || (user.role !== 'system_admin')) {
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

// 获取审核记录列表（支持按状态筛选）
router.get('/admin/records', authenticateToken, async (req, res) => {
    try {
        // 验证是否是管理员
        const user = await User.findByPk(req.user.userId);
        if (!user || (user.role !== 'system_admin')) {
            return res.status(403).json({ success: false, message: '无权限访问' });
        }

        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const status = req.query.status || 'pending'; // 支持 pending, approved, rejected

        const whereClause = { status };

        const records = await CheckinRecord.findAll({
            where: whereClause,
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

        // 获取服务器基础 URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // 格式化返回数据
        const formattedRecords = records.map(record => ({
            id: record.id,
            user: record.user?.username || '未知用户',
            userId: record.user?.id,
            img: record.imageUrl ? `${baseUrl}${record.imageUrl}` : '',
            aiResult: `${record.type} ${record.weight}kg`,
            time: new Date(record.createdAt).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
            points: record.points,
            stationName: record.station?.name || '未知站点',
            status: record.status
        }));

        res.json({
            success: true,
            data: formattedRecords
        });
    } catch (error) {
        console.error('获取审核记录失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 获取待审核记录列表（兼容旧接口）
router.get('/admin/pending', authenticateToken, async (req, res) => {
    try {
        // 验证是否是管理员
        const user = await User.findByPk(req.user.userId);
        if (!user || (user.role !== 'system_admin')) {
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

        // 获取服务器基础 URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // 格式化返回数据
        const formattedRecords = records.map(record => ({
            id: record.id,
            user: record.user?.username || '未知用户',
            userId: record.user?.id,
            img: record.imageUrl ? `${baseUrl}${record.imageUrl}` : '',
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
        const user = await User.findByPk(req.user.userId);
        if (!user || (user.role !== 'system_admin')) {
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
        const user = await User.findByPk(req.user.userId);
        if (!user || (user.role !== 'system_admin')) {
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
        const user = await User.findByPk(req.user.userId);
        if (!user || (user.role !== 'system_admin')) {
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
        const user = await User.findByPk(req.user.userId);
        if (!user || (user.role !== 'system_admin')) {
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
        const userId = req.user.userId;

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

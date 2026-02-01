import express from 'express';
import crypto from 'crypto';
import TraceRecord from '../models/TraceRecord.js';
import RecycleStation from '../models/RecycleStation.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * 计算环保成就
 * @param {number} weight - 回收重量 (kg)
 */
function calculateAchievement(weight) {
    return {
        items: (weight / 0.5).toFixed(1),      // 约 0.5kg 可制作 1 件 T恤
        carbon: (weight * 0.013).toFixed(2),   // 每 kg 塑料减少约 13g 碳排放
        oil: (weight * 0.006).toFixed(2)       // 每 kg 塑料节省约 6ml 石油
    };
}

/**
 * 生成批次号
 * @returns {Promise<string>} 批次号
 */
async function generateBatchNo() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // 查询今日已有批次数量
    const count = await TraceRecord.count({
        where: {
            batchNo: {
                [require('sequelize').Op.like]: `B-${dateStr}-%`
            }
        }
    });

    const seq = String(count + 1).padStart(5, '0');
    return `B-${dateStr}-${seq}`;
}

/**
 * 生成数据校验码 (SHA256)
 */
function generateHashDigest(record) {
    const data = JSON.stringify({
        batchNo: record.batchNo,
        weight: record.weight,
        type: record.wasteType,
        stationId: record.stationId,
        userId: record.userId,
        createdAt: record.createdAt
    });
    return crypto.createHash('sha256').update(data).digest('hex');
}

// ==================== 管理员 API（必须在通配路由之前）====================

/**
 * GET /api/trace/admin/list
 * 获取溯源记录列表（管理员）
 */
router.get('/admin/list', authenticateToken, async (req, res) => {
    try {
        // 验证管理员权限
        const user = await User.findByPk(req.user.userId);
        if (!user || user.role !== 'system_admin') {
            return res.status(403).json({ success: false, message: '无权限访问' });
        }

        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const records = await TraceRecord.findAll({
            include: [
                { model: RecycleStation, as: 'station', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const list = records.map(r => ({
            batchNo: r.batchNo,
            status: r.status,
            weight: `${r.weight} kg`,
            stationName: r.station?.name || '未知站点',
            hashDigest: r.hashDigest ? `${r.hashDigest.slice(0, 4)}...${r.hashDigest.slice(-4)}` : '-'
        }));

        res.json({ success: true, data: list });
    } catch (error) {
        console.error('获取溯源列表失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// ==================== 用户 API ====================

/**
 * GET /api/trace/:batchNo
 * 查询溯源详情（通配路由必须放在最后）
 */
router.get('/:batchNo', async (req, res) => {
    try {
        const { batchNo } = req.params;

        const record = await TraceRecord.findOne({
            where: { batchNo },
            include: [
                { model: RecycleStation, as: 'station', attributes: ['name'] },
                { model: User, as: 'user', attributes: ['username'] }
            ]
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: '未找到该批次的溯源信息'
            });
        }

        res.json({
            success: true,
            data: {
                batchNo: record.batchNo,
                status: record.status,
                weight: record.weight,
                type: record.wasteType,
                stationName: record.station?.name || '未知站点',
                checkinTime: record.createdAt.toLocaleString('zh-CN'),
                hashDigest: record.hashDigest,
                achievement: calculateAchievement(record.weight)
            }
        });
    } catch (error) {
        console.error('查询溯源详情失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

export default router;
export { generateBatchNo, generateHashDigest };

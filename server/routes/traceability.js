import express from 'express';
import { Op } from 'sequelize';
import crypto from 'crypto';
import TraceRecord from '../models/TraceRecord.js';
import RecycleStation from '../models/RecycleStation.js';
import User from '../models/User.js';
import CheckinRecord from '../models/CheckinRecord.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * 计算环保成就
 * @param {number} weight - 回收重量 (kg)
 * @param {string} type - 回收类型
 */
function calculateAchievement(weight, type = '') {
    const wasteType = (type || '').toLowerCase();
    
    // 默认配置 (塑料)
    let config = {
        unit: '件',
        product: '再生 T 恤',
        ratio: 0.5, // 0.5kg/item
        carbonFactor: 1.5, // 1kg 塑料约减少 1.5kg 碳排放
        oilFactor: 2.0     // 1kg 塑料约节省 2L 石油
    };

    if (wasteType.includes('纸') || wasteType.includes('paper')) {
        config = {
            unit: '个',
            product: '再生纸盒',
            ratio: 0.2,
            carbonFactor: 0.9,
            oilFactor: 0.5 // 纸张主要节省森林和水，这里映射为资源分值
        };
    } else if (wasteType.includes('金') || wasteType.includes('metal') || wasteType.includes('铝')) {
        config = {
            unit: '个',
            product: '再生易拉罐',
            ratio: 0.05,
            carbonFactor: 9.0, // 金属回收节能极高
            oilFactor: 4.5
        };
    } else if (wasteType.includes('玻') || wasteType.includes('glass')) {
        config = {
            unit: '个',
            product: '再生玻璃瓶',
            ratio: 0.3,
            carbonFactor: 0.3,
            oilFactor: 0.2
        };
    } else if (wasteType.includes('衣') || wasteType.includes('织') || wasteType.includes('textile')) {
        config = {
            unit: '块',
            product: '环保再生抹布',
            ratio: 0.1,
            carbonFactor: 3.5,
            oilFactor: 1.2
        };
    }

    // 确保 weight 是数字
    const numWeight = parseFloat(weight) || 0;

    return {
        items: Math.max(1, Math.floor(numWeight / config.ratio)),
        unit: config.unit,
        product: config.product,
        carbon: (numWeight * config.carbonFactor).toFixed(2),
        oil: (numWeight * config.oilFactor).toFixed(2)
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
                [Op.like]: `B-${dateStr}-%`
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
                { 
                    model: User, 
                    as: 'user', 
                    attributes: ['username'] 
                },
                {
                    model: CheckinRecord,
                    as: 'checkinRecord',
                    attributes: ['imageUrl']
                }
            ]
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: '未找到该批次的溯源信息'
            });
        }

        // 获取服务器基础 URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        res.json({
            success: true,
            data: {
                batchNo: record.batchNo,
                status: record.status,
                weight: record.weight,
                type: record.wasteType,
                stationName: record.station?.name || '未知站点',
                userName: record.user?.username || '匿名志愿者',
                imageUrl: record.checkinRecord?.imageUrl ? `${baseUrl}${record.checkinRecord.imageUrl}` : '',
                checkinTime: record.createdAt.toLocaleString('zh-CN'),
                hashDigest: record.hashDigest,
                achievement: calculateAchievement(record.weight, record.wasteType)
            }
        });
    } catch (error) {
        console.error('查询溯源详情失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

export default router;
export { generateBatchNo, generateHashDigest };

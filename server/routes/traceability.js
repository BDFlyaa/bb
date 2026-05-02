import express from 'express';
import { Op } from 'sequelize';
import crypto from 'crypto';
import TraceRecord from '../models/TraceRecord.js';
import RecycleStation from '../models/RecycleStation.js';
import User from '../models/User.js';
import CheckinRecord from '../models/CheckinRecord.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

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
        ratio: 1.2, // 1kg 塑料约守护 1.2㎡ 海域 (基于海滩清理覆盖率估算)
        carbonFactor: 1.5,
        oilFactor: 2.0
    };

    if (wasteType.includes('纸')) {
        config = {
            ratio: 0.8,
            carbonFactor: 0.9,
            oilFactor: 0.5
        };
    } else if (wasteType.includes('金') || wasteType.includes('铝')) {
        config = {
            ratio: 2.5, // 金属回收价值更高，折算守护面积更大
            carbonFactor: 9.0,
            oilFactor: 4.5
        };
    } else if (wasteType.includes('玻')) {
        config = {
            ratio: 0.5,
            carbonFactor: 0.3,
            oilFactor: 0.2
        };
    } else if (wasteType.includes('衣') || wasteType.includes('织')) {
        config = {
            ratio: 1.0,
            carbonFactor: 3.5,
            oilFactor: 1.2
        };
    }

    // 确保 weight 是数字
    const numWeight = parseFloat(weight) || 0;

    return {
        items: (numWeight * config.ratio).toFixed(1), // 改为计算守护面积
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
                { model: RecycleStation, as: 'station', attributes: ['name'] },
                { model: CheckinRecord, as: 'checkinRecord', attributes: ['imageUrl'] }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const list = records.map(r => ({
            id: r.id,
            batchNo: r.batchNo,
            status: r.status,
            weight: r.weight,
            wasteType: r.wasteType,
            stationId: r.stationId,
            userId: r.userId,
            stationName: r.sourceName || r.station?.name || '非官方点位 (个人清理)',
            imageUrl: r.checkinRecord?.imageUrl ? `${baseUrl}${r.checkinRecord.imageUrl}` : '',
            hashDigest: r.hashDigest ? `${r.hashDigest.slice(0, 4)}...${r.hashDigest.slice(-4)}` : '-',
            createdAt: r.createdAt
        }));

        res.json({ success: true, data: list });
    } catch (error) {
        console.error('获取溯源列表失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

/**
 * POST /api/trace/admin/create
 * 创建溯源记录（管理员）
 */
router.post('/admin/create', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { weight, wasteType, stationId, userId, status } = req.body;
        
        const batchNo = await generateBatchNo();
        const record = await TraceRecord.create({
            batchNo,
            weight: weight || 0,
            wasteType: wasteType || '塑料瓶',
            stationId: stationId || null,
            userId: userId || req.user.userId,
            status: status || 'completed',
            createdAt: new Date()
        });

        // 生成哈希校验码
        record.hashDigest = generateHashDigest(record);
        await record.save();

        res.json({ success: true, message: '创建成功', data: record });
    } catch (error) {
        console.error('创建溯源记录失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

/**
 * PUT /api/trace/admin/update/:batchNo
 * 更新溯源记录（管理员）
 */
router.put('/admin/update/:batchNo', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { batchNo } = req.params;
        const { weight, wasteType, stationId, status } = req.body;

        const record = await TraceRecord.findOne({ where: { batchNo } });
        if (!record) {
            return res.status(404).json({ success: false, message: '记录不存在' });
        }

        if (weight !== undefined) record.weight = weight;
        if (wasteType !== undefined) record.wasteType = wasteType;
        if (stationId !== undefined) record.stationId = stationId;
        if (status !== undefined) record.status = status;

        // 重新生成哈希校验码
        record.hashDigest = generateHashDigest(record);
        await record.save();

        res.json({ success: true, message: '更新成功', data: record });
    } catch (error) {
        console.error('更新溯源记录失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

/**
 * DELETE /api/trace/admin/delete/:batchNo
 * 删除溯源记录（管理员）
 */
router.delete('/admin/delete/:batchNo', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { batchNo } = req.params;
        const result = await TraceRecord.destroy({ where: { batchNo } });

        if (result === 0) {
            return res.status(404).json({ success: false, message: '记录不存在' });
        }

        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('删除溯源记录失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

/**
 * GET /api/trace/admin/export
 * 导出溯源报表（管理员）
 */
router.get('/admin/export', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const records = await TraceRecord.findAll({
            include: [
                { model: RecycleStation, as: 'station', attributes: ['name'] },
                { model: User, as: 'user', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // 生成 CSV 内容
        let csvContent = '\uFEFF'; // UTF-8 BOM
        csvContent += '批次号,状态,回收物类型,重量(kg),来源站点,回收人,校验码,创建时间\n';

        records.forEach(r => {
            const statusText = r.status === 'completed' ? '已完成' : '处理中';
            const stationName = r.station?.name || '非官方点位 (个人清理)';
            const userName = r.user?.username || '未知';
            const createdAt = r.createdAt.toLocaleString('zh-CN');
            
            csvContent += `"${r.batchNo}","${statusText}","${r.wasteType}",${r.weight},"${stationName}","${userName}","${r.hashDigest}","${createdAt}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=traceability_report_${new Date().getTime()}.csv`);
        res.send(csvContent);
    } catch (error) {
        console.error('导出报表失败:', error);
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
                stationName: record.sourceName || record.station?.name || '非官方点位 (个人清理)',
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

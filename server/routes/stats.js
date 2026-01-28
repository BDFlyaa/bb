import express from 'express';
import { Op, fn, col, literal } from 'sequelize';
import CheckinRecord from '../models/CheckinRecord.js';
import User from '../models/User.js';
import RecycleStation from '../models/RecycleStation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 计算碳减排量（简化公式：每kg塑料减排约2.8kg CO2）
const calculateCarbonReduction = (totalWeight) => {
    return (totalWeight * 2.8 / 1000).toFixed(1); // 转换为吨
};

// 获取总体统计数据
router.get('/overview', async (req, res) => {
    try {
        // 累计回收总量
        const totalResult = await CheckinRecord.findOne({
            attributes: [[fn('SUM', col('weight')), 'totalWeight']],
            where: { status: 'approved' }
        });
        const totalWeight = parseFloat(totalResult?.dataValues?.totalWeight || 0);

        // 今日新增
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayResult = await CheckinRecord.findOne({
            attributes: [[fn('SUM', col('weight')), 'todayWeight']],
            where: {
                status: 'approved',
                createdAt: { [Op.gte]: today }
            }
        });
        const todayWeight = parseFloat(todayResult?.dataValues?.todayWeight || 0);

        // 碳减排量
        const carbonReduction = calculateCarbonReduction(totalWeight);

        res.json({
            totalWeight: totalWeight.toFixed(1),
            todayWeight: todayWeight.toFixed(1),
            carbonReduction
        });
    } catch (error) {
        console.error('获取统计概览失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取实时回收动态（最近10条）
router.get('/recent-activities', async (req, res) => {
    try {
        const activities = await CheckinRecord.findAll({
            where: { status: 'approved' },
            include: [
                { model: User, as: 'user', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const formattedActivities = activities.map(a => ({
            id: a.id,
            time: new Date(a.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            user: a.user?.username || '匿名用户',
            weight: a.weight,
            type: a.type
        }));

        res.json(formattedActivities);
    } catch (error) {
        console.error('获取实时动态失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取志愿者排行榜
router.get('/rankings', async (req, res) => {
    try {
        const rankings = await CheckinRecord.findAll({
            attributes: [
                'userId',
                [fn('SUM', col('weight')), 'totalWeight']
            ],
            where: { status: 'approved' },
            include: [
                { model: User, as: 'user', attributes: ['username'] }
            ],
            group: ['userId', 'user.id', 'user.username'],
            order: [[literal('totalWeight'), 'DESC']],
            limit: 10
        });

        const formattedRankings = rankings.map(r => ({
            name: r.user?.username || '匿名用户',
            score: parseFloat((parseFloat(r.dataValues.totalWeight || 0)).toFixed(2))
        }));

        res.json(formattedRankings);
    } catch (error) {
        console.error('获取排行榜失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取7日回收趋势
router.get('/weekly-trend', async (req, res) => {
    try {
        const days = [];
        const results = [];

        // 获取过去7天的数据
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const dayResult = await CheckinRecord.findOne({
                attributes: [[fn('SUM', col('weight')), 'dayWeight']],
                where: {
                    status: 'approved',
                    createdAt: {
                        [Op.gte]: date,
                        [Op.lt]: nextDate
                    }
                }
            });

            const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            days.push(weekdays[date.getDay()]);
            results.push(parseFloat((parseFloat(dayResult?.dataValues?.dayWeight || 0)).toFixed(2)));
        }

        res.json({ days, weights: results });
    } catch (error) {
        console.error('获取趋势数据失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取用户个人统计
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        // 累计回收量
        const totalResult = await CheckinRecord.findOne({
            attributes: [[fn('SUM', col('weight')), 'totalWeight']],
            where: { userId, status: 'approved' }
        });
        const totalWeight = parseFloat(totalResult?.dataValues?.totalWeight || 0);

        // 获取用户积分
        const user = await User.findByPk(userId, {
            attributes: ['points', 'username']
        });

        // 回收次数
        const checkinCount = await CheckinRecord.count({
            where: { userId, status: 'approved' }
        });

        // 拯救海洋生物数（简化公式：每10kg拯救1只）
        const savedAnimals = Math.floor(totalWeight / 10);

        // 计算等级（每500积分一级）
        const points = user?.points || 0;
        const level = Math.floor(points / 500) + 1;
        const nextLevelPoints = level * 500;
        const levelProgress = ((points % 500) / 500 * 100).toFixed(0);

        // Tasks status
        const tasks = [
            {
                id: 1,
                text: "完成一次塑料瓶回收",
                reward: "+50积分",
                done: checkinCount > 0
            },
            {
                id: 2,
                text: "参与海滩清洁活动",
                reward: "+200积分",
                done: false // 暂时硬编码为未完成，后续需关联活动参与记录
            },
            {
                id: 3,
                text: "邀请一位好友加入",
                reward: "+100积分",
                done: false // 暂时硬编码为未完成，后续需关联邀请记录
            }
        ];

        res.json({
            username: user?.username || '用户',
            totalWeight: totalWeight.toFixed(1),
            points,
            checkinCount,
            savedAnimals,
            level,
            levelProgress: parseInt(levelProgress),
            pointsToNextLevel: nextLevelPoints - points,
            tasks
        });
    } catch (error) {
        console.error('获取用户统计失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 物资库存监控（模拟数据）
router.get('/inventory', async (req, res) => {
    try {
        // 返回模拟的库存数据
        res.json({
            items: [
                { name: '回收袋', percentage: 15, warning: true },
                { name: '手套', percentage: 85, warning: false },
                { name: '消毒液', percentage: 60, warning: false }
            ]
        });
    } catch (error) {
        console.error('获取库存数据失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 完成任务并获取积分
router.post('/complete-task', authenticateToken, async (req, res) => {
    try {
        const { userId, taskId } = req.body;

        if (!userId || !taskId) {
            return res.status(400).json({ message: '缺少参数' });
        }

        // 任务奖励映射
        const taskRewards = {
            1: { points: 50, desc: '完成一次塑料瓶回收' },
            2: { points: 200, desc: '参与海滩清洁活动' },
            3: { points: 100, desc: '邀请一位好友加入' }
        };

        const reward = taskRewards[taskId];
        if (!reward) {
            return res.status(400).json({ message: '无效的任务ID' });
        }

        // 更新用户积分
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        user.points = (user.points || 0) + reward.points;
        await user.save();

        res.json({
            success: true,
            message: `任务完成！获得 ${reward.points} 积分`,
            newPoints: user.points
        });
    } catch (error) {
        console.error('完成任务失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

export default router;

import express from 'express';
import { Op, fn, col, literal } from 'sequelize';
import sequelize from '../db.js';
import CheckinRecord from '../models/CheckinRecord.js';
import User from '../models/User.js';
import RecycleStation from '../models/RecycleStation.js';
import TaskCompletion from '../models/TaskCompletion.js';
import TaskParticipation from '../models/TaskParticipation.js';
import Inventory from '../models/Inventory.js';
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

// 获取回收物资分类占比
router.get('/category-breakdown', async (req, res) => {
    try {
        // 按类型统计回收重量
        const categoryStats = await CheckinRecord.findAll({
            attributes: [
                'type',
                [fn('SUM', col('weight')), 'totalWeight']
            ],
            where: { status: 'approved' },
            group: ['type'],
            order: [[literal('totalWeight'), 'DESC']]
        });

        // 计算总重量
        const totalWeight = categoryStats.reduce((sum, cat) => {
            return sum + parseFloat(cat.dataValues.totalWeight || 0);
        }, 0);

        // 定义分类颜色映射
        const colorMap = {
            '塑料瓶': '#00e5ff',
            'PET塑料瓶': '#00e5ff',
            '渔网': '#00ff9d',
            '海洋渔网': '#00ff9d',
            'HDPE塑料': '#00b4db',
            '混合塑料': '#00b4db',
            '其他': '#bd93f9',
            '其他废弃物': '#bd93f9',
            '海洋漂浮物': '#ff79c6'
        };

        // 格式化返回数据
        const categories = categoryStats.map(cat => {
            const weight = parseFloat(cat.dataValues.totalWeight || 0);
            const percentage = totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0;
            const typeName = cat.type || '其他';
            return {
                name: typeName,
                weight: weight.toFixed(1),
                percentage,
                color: colorMap[typeName] || '#bd93f9'
            };
        });

        res.json({
            totalWeight: totalWeight.toFixed(1),
            categories
        });
    } catch (error) {
        console.error('获取分类占比失败:', error);
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
            limit: 20
        });

        const formattedActivities = activities.map(a => {
            const d = new Date(a.createdAt);
            const timeStr = `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

            return {
                id: a.id,
                time: timeStr,
                user: a.user?.username || '匿名用户',
                weight: a.weight,
                type: a.type
            };
        });

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

// 获取7日回收趋势（优化版：单次查询）
router.get('/weekly-trend', async (req, res) => {
    try {
        // 计算7天前的起始日期
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // 单次查询获取7天内的数据，按日期分组
        const dailyStats = await CheckinRecord.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('SUM', col('weight')), 'totalWeight']
            ],
            where: {
                status: 'approved',
                createdAt: { [Op.gte]: sevenDaysAgo }
            },
            group: [fn('DATE', col('createdAt'))],
            raw: true
        });

        // 构建日期到重量的映射
        const weightByDate = {};
        dailyStats.forEach(stat => {
            const dateKey = stat.date;
            weightByDate[dateKey] = parseFloat(stat.totalWeight || 0);
        });

        // 生成过去7天的数据
        const days = [];
        const weights = [];
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dateKey = date.toISOString().slice(0, 10);
            days.push(weekdays[date.getDay()]);
            weights.push(parseFloat((weightByDate[dateKey] || 0).toFixed(2)));
        }

        res.json({ days, weights });
    } catch (error) {
        console.error('获取趋势数据失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取用户个人统计
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        // 验证用户只能访问自己的数据（除非是管理员）
        if (req.user.userId != userId && req.user.role !== 'system_admin') {
            return res.status(403).json({ message: '无权访问他人数据' });
        }

        // 累计回收量
        const totalResult = await CheckinRecord.findOne({
            attributes: [[fn('SUM', col('weight')), 'totalWeight']],
            where: { userId, status: 'approved' }
        });
        const totalWeight = parseFloat(totalResult?.dataValues?.totalWeight || 0);

        // 获取用户积分
        const user = await User.findByPk(userId, {
            attributes: ['id', 'points', 'username']
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

        // 查询用户任务完成状态
        const completedTasks = await TaskCompletion.findAll({
            where: { userId },
            attributes: ['taskId']
        });
        const completedTaskIds = completedTasks.map(t => t.taskId);

        // 查询用户是否参与过海滩清洁活动（任务2）
        const activityParticipation = await TaskParticipation.findOne({
            where: {
                username: user?.username,
                status: 'joined'
            }
        });
        const hasParticipatedActivity = !!activityParticipation;

        // 任务奖励映射
        const taskRewardsMap = {
            1: { points: 50, desc: '完成一次塑料瓶回收' },
            2: { points: 200, desc: '参与海滩清洁活动' },
            3: { points: 100, desc: '邀请一位好友加入' }
        };

        // 自动检测是否满足任务条件
        const autoDetected = {
            1: checkinCount > 0,
            2: hasParticipatedActivity
        };

        // 对于自动检测完成但尚未创建 TaskCompletion 记录的任务，自动发放积分
        // 使用事务确保积分和任务记录的一致性
        let pointsAwarded = 0;
        
        // 只有在有新任务完成时才开启事务
        const newTasks = Object.entries(autoDetected)
            .filter(([taskIdStr, detected]) => {
                const taskId = parseInt(taskIdStr);
                return detected && !completedTaskIds.includes(taskId);
            });

        if (newTasks.length > 0) {
            const transaction = await sequelize.transaction();
            try {
                for (const [taskIdStr, _] of newTasks) {
                    const taskId = parseInt(taskIdStr);
                    const reward = taskRewardsMap[taskId];
                    
                    await TaskCompletion.create({
                        userId,
                        taskId,
                        pointsAwarded: reward.points,
                        completedAt: new Date()
                    }, { transaction });
                    
                    pointsAwarded += reward.points;
                    completedTaskIds.push(taskId);
                }

                if (pointsAwarded > 0 && user) {
                    user.points = (user.points || 0) + pointsAwarded;
                    await user.save({ transaction });
                }
                
                await transaction.commit();
            } catch (err) {
                await transaction.rollback();
                console.error('自动发放任务积分失败:', err);
                // 事务回滚，积分和记录都不会保存，下次请求会重试
                pointsAwarded = 0; // 重置以便前端显示正确（或者不重置，显示旧值）
            }
        }

        // 更新 points 变量以反映最新积分
        const updatedPoints = user?.points || points;

        // Tasks status
        const tasks = [
            {
                id: 1,
                text: "完成一次塑料瓶回收",
                reward: "+50积分",
                done: checkinCount > 0 || completedTaskIds.includes(1)
            },
            {
                id: 2,
                text: "参与海滩清洁活动",
                reward: "+200积分",
                done: hasParticipatedActivity || completedTaskIds.includes(2)
            },
            {
                id: 3,
                text: "邀请一位好友加入",
                reward: "+100积分",
                done: completedTaskIds.includes(3)  // 暂无自动检测，需手动完成
            }
        ];

        // 计算勋章解锁状态（使用最新积分）
        const finalPoints = updatedPoints;
        const finalLevel = Math.floor(finalPoints / 500) + 1;
        const finalNextLevelPoints = finalLevel * 500;
        const finalLevelProgress = ((finalPoints % 500) / 500 * 100).toFixed(0);

        const medals = [
            {
                id: 'beginner',
                name: '初级卫士',
                icon: '铜牌.png',
                description: '开始守护海洋的第一步',
                unlocked: checkinCount >= 1
            },
            {
                id: 'classifier',
                name: '分类达人',
                icon: '分类达人.png',
                description: '熟练掌握垃圾分类',
                unlocked: checkinCount >= 5
            },
            {
                id: 'ocean_friend',
                name: '海洋之友',
                icon: '海洋之友.png',
                description: '为海洋做出显著贡献',
                unlocked: totalWeight >= 20
            },
            {
                id: 'eco_master',
                name: '环保大师',
                icon: '环保大师.png',
                description: '环保领域的佼佼者',
                unlocked: finalPoints >= 1000
            }
        ];

        res.json({
            username: user?.username || '用户',
            totalWeight: totalWeight.toFixed(1),
            points: finalPoints,
            checkinCount,
            savedAnimals,
            level: finalLevel,
            levelProgress: parseInt(finalLevelProgress),
            pointsToNextLevel: finalNextLevelPoints - finalPoints,
            tasks,
            medals
        });
    } catch (error) {
        console.error('获取用户统计失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 物资库存监控
router.get('/inventory', async (req, res) => {
    try {
        // 从数据库读取真实库存数据
        let inventoryItems = await Inventory.findAll({
            order: [['name', 'ASC']]
        });

        // 如果数据库为空，创建默认数据
        if (inventoryItems.length === 0) {
            const defaultItems = [
                { name: '回收袋', quantity: 15, maxQuantity: 100, warningThreshold: 20, unit: '个' },
                { name: '手套', quantity: 85, maxQuantity: 100, warningThreshold: 20, unit: '副' },
                { name: '消毒液', quantity: 60, maxQuantity: 100, warningThreshold: 20, unit: '瓶' }
            ];
            await Inventory.bulkCreate(defaultItems);
            inventoryItems = await Inventory.findAll({ order: [['name', 'ASC']] });
        }

        // 格式化返回数据
        const items = inventoryItems.map(item => {
            const percentage = Math.round((item.quantity / item.maxQuantity) * 100);
            return {
                name: item.name,
                percentage,
                quantity: item.quantity,
                maxQuantity: item.maxQuantity,
                unit: item.unit,
                warning: percentage <= item.warningThreshold
            };
        });

        res.json({ items });
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

        // 验证用户只能为自己完成任务
        if (req.user.userId != userId) {
            return res.status(403).json({ message: '无权为他人完成任务' });
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

        // 检查任务是否已完成
        const existingCompletion = await TaskCompletion.findOne({
            where: { userId, taskId }
        });

        if (existingCompletion) {
            return res.status(400).json({
                message: '该任务已完成，不能重复领取奖励',
                completedAt: existingCompletion.completedAt
            });
        }

        // 获取用户
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 记录任务完成
        await TaskCompletion.create({
            userId,
            taskId,
            pointsAwarded: reward.points,
            completedAt: new Date()
        });

        // 更新用户积分
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

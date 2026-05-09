import express from 'express';
import { Op } from 'sequelize';
import sequelize from '../db.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ==================== 公开接口 ====================

// 获取所有上架商品
router.get('/products', async (req, res) => {
    try {
        const { category } = req.query;
        const where = { status: 'active' };

        if (category && category !== 'all') {
            where.category = category;
        }

        const products = await Product.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });

        res.json(products);
    } catch (error) {
        console.error('获取商品列表失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// ==================== 用户接口（需认证） ====================

// 兑换商品
router.post('/redeem/:productId', authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { productId } = req.params;
        const { address, phone } = req.body;
        const userId = req.user.userId;

        // 查找商品
        const product = await Product.findByPk(productId, { transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(404).json({ message: '商品不存在' });
        }

        if (product.status !== 'active') {
            await transaction.rollback();
            return res.status(400).json({ message: '该商品已下架' });
        }

        if (product.inventory <= 0) {
            await transaction.rollback();
            return res.status(400).json({ message: '库存不足' });
        }

        // 查找用户
        const user = await User.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ message: '用户不存在' });
        }

        if (user.points < product.points) {
            await transaction.rollback();
            return res.status(400).json({ message: '积分不足' });
        }

        // 扣除积分
        user.points -= product.points;
        await user.save({ transaction });

        // 扣除库存
        product.inventory -= 1;
        await product.save({ transaction });

        // 创建订单
        const order = await Order.create({
            userId,
            productId: product.id,
            productName: product.name,
            productIcon: product.icon,
            pointsCost: product.points,
            status: 'pending',
            address: address || null,
            phone: phone || null,
        }, { transaction });

        await transaction.commit();

        res.json({
            message: '兑换成功',
            order: {
                id: order.id,
                productName: order.productName,
                productIcon: order.productIcon,
                pointsCost: order.pointsCost,
                status: order.status,
                createdAt: order.createdAt,
            },
            remainingPoints: user.points,
        });
    } catch (error) {
        await transaction.rollback();
        console.error('兑换失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取当前用户的订单列表
router.get('/orders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const orders = await Order.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });

        res.json(orders);
    } catch (error) {
        console.error('获取订单列表失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取用户当前积分
router.get('/points', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'points'],
        });

        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.json({ points: user.points });
    } catch (error) {
        console.error('获取积分失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// ==================== 管理员接口 ====================

// 获取所有商品（包括下架的）
router.get('/admin/products', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['createdAt', 'DESC']],
        });
        res.json(products);
    } catch (error) {
        console.error('获取商品列表失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 新增商品
router.post('/products', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, points, icon, description, category, inventory } = req.body;

        if (!name || !points) {
            return res.status(400).json({ message: '商品名称和积分价格为必填项' });
        }

        const product = await Product.create({
            name,
            points,
            icon: icon || '🎁',
            description: description || '',
            category: category || 'other',
            inventory: inventory || 0,
            status: 'active',
        });

        res.status(201).json({ message: '商品创建成功', product });
    } catch (error) {
        console.error('创建商品失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 修改商品
router.put('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, points, icon, description, category, inventory, status } = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: '商品不存在' });
        }

        // 更新字段
        if (name !== undefined) product.name = name;
        if (points !== undefined) product.points = points;
        if (icon !== undefined) product.icon = icon;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (inventory !== undefined) product.inventory = inventory;
        if (status !== undefined) product.status = status;

        await product.save();

        res.json({ message: '商品更新成功', product });
    } catch (error) {
        console.error('更新商品失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 删除/下架商品
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: '商品不存在' });
        }

        // 硬删除：从数据库中移除
        await product.destroy();

        res.json({ message: '商品已删除' });
    } catch (error) {
        console.error('删除商品失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取所有订单（管理员视图）
router.get('/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        const orders = await Order.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(orders);
    } catch (error) {
        console.error('获取订单列表失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 标记订单为已发货
router.put('/admin/orders/:id/ship', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: '订单不存在' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: '只能处理待发货的订单' });
        }

        order.status = 'shipped';
        await order.save();

        // 发送通知：订单已发货
        Notification.create({
            userId: order.userId,
            type: 'order_shipped',
            title: '订单已发货',
            content: `您的订单 #${order.id}（${order.productName}）已发货，请留意收货`,
            relatedId: order.id,
            relatedType: 'order',
        }).catch(e => console.error('创建发货通知失败:', e.original?.sqlMessage || e.message || e));

        res.json({ message: '订单已标记为发货', order });
    } catch (error) {
        console.error('处理订单失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 取消发货（恢复为待发货）
router.put('/admin/orders/:id/unship', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: '订单不存在' });
        }

        if (order.status !== 'shipped') {
            return res.status(400).json({ message: '只能取消已发货的订单' });
        }

        order.status = 'pending';
        await order.save();

        res.json({ message: '订单已取消发货，恢复为待发货状态', order });
    } catch (error) {
        console.error('取消发货失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 取消订单
router.put('/admin/orders/:id/cancel', authenticateToken, requireAdmin, async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id, { transaction });
        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ message: '订单不存在' });
        }

        if (order.status !== 'pending') {
            await transaction.rollback();
            return res.status(400).json({ message: '只能取消待发货的订单' });
        }

        // 恢复库存
        const product = await Product.findByPk(order.productId, { transaction });
        if (product) {
            product.inventory += 1;
            await product.save({ transaction });
        }

        // 退还积分
        const user = await User.findByPk(order.userId, { transaction });
        if (user) {
            user.points += order.pointsCost;
            await user.save({ transaction });
        }

        order.status = 'cancelled';
        await order.save({ transaction });

        await transaction.commit();

        // 发送通知：订单已取消（不在事务内，失败不影响取消）
        Notification.create({
            userId: order.userId,
            type: 'order_cancelled',
            title: '订单已取消',
            content: `您的订单 #${order.id}（${order.productName}）已取消，${order.pointsCost} 积分已退还`,
            relatedId: order.id,
            relatedType: 'order',
        }).catch(e => console.error('创建取消订单通知失败:', e.original?.sqlMessage || e.message || e));

        res.json({ message: '订单已取消，积分已退还', order });
    } catch (error) {
        await transaction.rollback();
        console.error('取消订单失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

export default router;

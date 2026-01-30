import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import User from './User.js';
import Product from './Product.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: 'id',
        },
    },
    // 快照字段，保存下单时的商品信息
    productName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productIcon: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },
    pointsCost: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'shipped', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

// 设置关联关系
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Product.hasMany(Order, { foreignKey: 'productId', as: 'orders' });

export default Order;

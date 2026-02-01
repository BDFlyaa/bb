import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

// 物资库存模型 - 用于管理回收站物资
const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: '物资名称，如：回收袋、手套、消毒液'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        },
        comment: '当前库存数量'
    },
    maxQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
        comment: '最大库存容量'
    },
    warningThreshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20,
        comment: '低库存警告阈值（百分比）'
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '个',
        comment: '单位：个、箱、瓶等'
    },
    lastRestockedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '最近补货时间'
    }
}, {
    timestamps: true
});

export default Inventory;

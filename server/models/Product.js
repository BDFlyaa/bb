import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  icon: {
    type: DataTypes.TEXT('long'),
    // MySQL 不允许 TEXT 类型有默认值，已在路由层处理默认值
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('daily', 'clothing', 'other'),
    defaultValue: 'other',
  },
  inventory: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
}, {
  timestamps: true,
});

export default Product;

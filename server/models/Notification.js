import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import User from './User.js';

const Notification = sequelize.define('Notification', {
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
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  relatedType: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId', 'isRead'] },
    { fields: ['userId', 'createdAt'] },
  ],
});

// 关联关系
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

export default Notification;

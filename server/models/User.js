import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('volunteer', 'system_admin'),
    defaultValue: 'volunteer',
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0  // 积分不能为负数
    }
  },
  mutedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  nickname: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: '展示昵称，默认可空，前端显示为 nickname 或回退到 username',
  },
  avatar: {
    type: DataTypes.STRING(512),
    allowNull: true,
    defaultValue: '',
  },
  bio: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: '',
  },
}, {
  timestamps: true,
});

export default User;

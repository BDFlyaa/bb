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
  },
  mutedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  }
}, {
  timestamps: true,
});

export default User;

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const RecycleStation = sequelize.define('RecycleStation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lng: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('normal', 'full', 'maintenance'),
    defaultValue: 'normal',
  },
  statusText: {
    type: DataTypes.STRING,
    defaultValue: '正常运行',
  }
}, {
  timestamps: true,
});

export default RecycleStation;

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import User from './User.js';
import RecycleStation from './RecycleStation.js';

const StationReport = sequelize.define('StationReport', {
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
  stationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: RecycleStation,
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('full', 'damaged', 'other'),
    allowNull: false,
  },
  desc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processed', 'ignored'),
    defaultValue: 'pending',
  }
}, {
  timestamps: true,
});

StationReport.belongsTo(User, { foreignKey: 'userId', as: 'reporter' });
StationReport.belongsTo(RecycleStation, { foreignKey: 'stationId', as: 'station' });

export default StationReport;

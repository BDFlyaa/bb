import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import User from './User.js';

const StationAudit = sequelize.define('StationAudit', {
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
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  note: {
    type: DataTypes.STRING, // 审核备注
    allowNull: true,
  }
}, {
  timestamps: true,
});

StationAudit.belongsTo(User, { foreignKey: 'userId', as: 'applicant' });

export default StationAudit;

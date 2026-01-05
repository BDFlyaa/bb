import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Ranking = sequelize.define('Ranking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  period: {
    type: DataTypes.STRING,
    defaultValue: 'monthly',
  }
}, {
  timestamps: true,
});

export default Ranking;

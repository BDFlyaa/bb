import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import User from './User.js';
import RecycleStation from './RecycleStation.js';

const CheckinRecord = sequelize.define('CheckinRecord', {
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
        allowNull: true,
        references: {
            model: RecycleStation,
            key: 'id',
        },
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '塑料瓶',
        comment: '回收类型：塑料瓶、渔网、混合塑料、海洋漂浮物等',
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: '回收重量(kg)',
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '获得积分',
    },
    checkinType: {
        type: DataTypes.ENUM('scan', 'ai_recognition'),
        defaultValue: 'scan',
        comment: '打卡方式：扫码/AI识别',
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'AI识别图片URL',
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'approved',
        comment: '审核状态',
    }
}, {
    timestamps: true,
});

// 关联关系
CheckinRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CheckinRecord.belongsTo(RecycleStation, { foreignKey: 'stationId', as: 'station' });

export default CheckinRecord;

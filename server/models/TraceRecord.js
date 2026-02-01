import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import User from './User.js';
import RecycleStation from './RecycleStation.js';
import CheckinRecord from './CheckinRecord.js';

const TraceRecord = sequelize.define('TraceRecord', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    batchNo: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        comment: '批次号，格式：B-YYYYMMDD-XXXXX',
    },
    checkinRecordId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CheckinRecord,
            key: 'id',
        },
        comment: '关联的打卡记录ID',
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
    wasteType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '塑料瓶',
        comment: '回收类型',
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: '回收重量(kg)',
    },
    status: {
        type: DataTypes.ENUM('processing', 'completed'),
        defaultValue: 'completed',
        comment: '溯源状态',
    },
    hashDigest: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: 'SHA256 数据校验码',
    }
}, {
    timestamps: true
});

// 关联关系
TraceRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TraceRecord.belongsTo(RecycleStation, { foreignKey: 'stationId', as: 'station' });
TraceRecord.belongsTo(CheckinRecord, { foreignKey: 'checkinRecordId', as: 'checkinRecord' });

export default TraceRecord;

import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

// 用户任务完成记录表 - 用于防止重复完成任务刷取积分
const TaskCompletion = sequelize.define('TaskCompletion', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '任务ID：1=塑料瓶回收, 2=海滩清洁活动, 3=邀请好友'
    },
    pointsAwarded: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '获得的积分数量'
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'taskId'],
            name: 'unique_user_task'
        }
    ]
});

export default TaskCompletion;

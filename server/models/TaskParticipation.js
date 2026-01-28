import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const TaskParticipation = sequelize.define('TaskParticipation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('joined', 'left'),
        defaultValue: 'joined',
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['taskId', 'username']
        }
    ]
});

export default TaskParticipation;

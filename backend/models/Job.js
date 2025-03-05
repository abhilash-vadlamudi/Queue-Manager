import { DataTypes } from 'sequelize';
import { sequelize } from '../database.js';
import Transaction from './Transaction.js';

const Job = sequelize.define('Job', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    customId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,  // Ensure customId is unique
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    retries: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    lastAttempt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true
});

export default Job;

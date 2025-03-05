import { DataTypes } from 'sequelize';
import { sequelize } from '../database.js';

import Job from './Job.js';

const Transaction = sequelize.define('Transaction', {
    jobId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    customId: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: false,  // ✅ Jobs can have multiple failed attempts, so not unique
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: true
});

export default Transaction;

import express from 'express';
import Job from '../models/Job.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// ✅ Fetch Transactions for a Specific Job
router.get('/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        // ✅ Check if job exists
        const job = await Job.findByPk(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // ✅ Fetch related transactions
        const transactions = await Transaction.findAll({
            where: { jobId },
            order: [['timestamp', 'DESC']] // Show latest transactions first
        });

        res.json(transactions);
    } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        res.status(500).json({ success: false, message: "Error fetching transactions", error: error.message });
    }
});

export default router;

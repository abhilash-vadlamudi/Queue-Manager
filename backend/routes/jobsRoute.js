import express from 'express';
import Job from '../models/Job.js';
import { addJobToQueue, jobQueue } from '../queue.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const newJob = await addJobToQueue();
        
        if (!newJob || !newJob.id) {
            console.error("❌ ERROR: Job creation failed, invalid response:", newJob);
            return res.status(500).json({ success: false, message: "Job creation failed" });
        }

        console.log("✅ New Job Added:", newJob);
        req.app.get('io').emit('jobUpdate', newJob); // ✅ Ensure job update is emitted

        res.json({ success: true, job: newJob });
    } catch (error) {
        console.error("❌ Error adding job:", error.message || error);
        res.status(500).json({ success: false, message: "Error adding job", error: error.message });
    }
});

// GET Jobs with Pagination and Sorting (latest jobs first)
router.get('/', async (req, res) => {
    try {
        // Get page and limit from query params, with default values
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate offset (the number of records to skip)
        const offset = (page - 1) * limit;

        // Fetch jobs with pagination, sorted by createdAt (newest first)
        const jobs = await Job.findAll({
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],  // Sort by createdAt in descending order
        });

        // Get total count of jobs
        const totalJobs = await Job.count();

        // Calculate total pages
        const totalPages = Math.ceil(totalJobs / limit);

        // Return the paginated response
        res.json({
            success: true,
            jobs,
            pagination: {
                currentPage: page,
                totalPages,
                totalJobs,
            },
        });
    } catch (error) {
        console.error("❌ Error fetching jobs:", error.message || error);
        res.status(500).json({ success: false, message: "Error fetching jobs", error: error.message });
    }
});

export default router;

import { Queue, Worker, JobScheduler } from 'bullmq';
import Job from './models/Job.js';
import Transaction from './models/Transaction.js';
import Redis from 'ioredis';

// ✅ Setup Redis Connection
const connection = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

// ✅ Create Job Queue with Default Options
const jobQueue = new Queue('jobQueue', { 
    connection,
    defaultJobOptions: {
        attempts: 3,  // ✅ Max Retries (Total = 1 initial + 2 retries)
        backoff: { type: 'exponential', delay: 5000 }, // ✅ Retry Delay
        removeOnComplete: true, 
        removeOnFail: true,  // ❌ Usually we keep failed jobs for debugging, but as per assigment requirment removing this.
    }
});

// ✅ Initialize JobScheduler
(async () => {
    try {
        console.log("🔄 Initializing JobScheduler...");
        const scheduler = new JobScheduler('jobQueue', { connection });

        await scheduler.waitUntilReady();
        console.log("✅ JobScheduler is ready.");
    } catch (error) {
        console.error("❌ Failed to initialize JobScheduler:", error.message || error);
    }
})();

// ✅ Generate a Unique Custom ID
function generateCustomId() {
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, ""); // YYYYMMDDHHMMSS
    return `JOB-${randomDigits}-${timestamp}`;
}

// ✅ Add Job to Queue (DB + BullMQ)
export async function addJobToQueue() {
    try {
        // ✅ Generate a unique custom ID
        const customId = generateCustomId();

        // ✅ Create job in DB
        const jobRecord = await Job.create({ customId, status: 'Pending' });

        // ✅ Add job to BullMQ with the SAME customId
        const job = await jobQueue.add(customId, {}, { jobId: customId });

        console.log(`🆕 Added Job: BullMQ ID = ${job.id}, DB ID = ${jobRecord.id}, Custom ID = ${jobRecord.customId}`);

        return {
            id: jobRecord.id,
            customId: jobRecord.customId,
            status: jobRecord.status,
            retries: jobRecord.retries || 0,
            lastAttempt: jobRecord.lastAttempt || null,
        };
    } catch (error) {
        console.error("❌ Error adding job to queue:", error.message);
        throw new Error("Failed to add job to queue.");
    }
}

// ✅ Initialize Queue & Workers
export function initializeQueue(io) {
    console.log("🔄 Starting worker for jobQueue...");

    const worker = new Worker('jobQueue', async (job) => {
        console.log(`🛠️ Processing Job: ${job.id}, Attempt: ${job.attemptsMade + 1}/${job.opts.attempts}`);

        // ✅ Find the job in the database using `customId`
        let dbJob = await Job.findOne({ where: { customId: job.id } });

        if (!dbJob) {
            console.error(`❌ Job ${job.id} NOT found in database! Skipping processing.`);
            return;
        }

        try {
            // ✅ Update Job Status
            dbJob.status = 'In Progress';
            dbJob.retries = job.attemptsMade;
            dbJob.lastAttempt = new Date();
            await dbJob.save();

            if (io) io.emit('jobUpdate', dbJob);

            // ✅ Simulate Job Execution
            await new Promise(resolve => setTimeout(resolve, 3000));

            // ✅ Simulate Failure (50% Chance)
            if (Math.random() < 0.5) {
                throw new Error("Simulated job failure for retry test");
            }

            // ✅ Job Completed Successfully
            dbJob.status = 'Completed';
            await dbJob.save();
            console.log(`✅ Job ${dbJob.customId} completed`);

            // ✅ Log Completed Transaction ONLY IF NOT RECORDED BEFORE
            const existingCompleted = await Transaction.findOne({
                where: { jobId: dbJob.id, status: 'Completed' }
            });

            if (!existingCompleted) {
                await Transaction.create({ jobId: dbJob.id, customId: dbJob.customId, status: 'Completed', errorMessage: null });
            }

            if (io) io.emit('jobUpdate', dbJob);
        } catch (error) {
            console.error(`❌ Job ${dbJob.customId} failed:`, error.message);

            dbJob.retries = job.attemptsMade;
            dbJob.lastAttempt = new Date();
            await dbJob.save();

            // ✅ Log a Transaction for Every Failed Attempt
            await Transaction.create({
                jobId: dbJob.id,
                customId: dbJob.customId,
                status: 'Failed',
                errorMessage: error.message,
                timestamp: new Date(),
            });

            console.error(`❌ Job ${job.id} failed (Attempt ${job.attemptsMade + 1}/${job.opts.attempts}):`, error.message);

            if (job.attemptsMade + 1 >= job.opts.attempts) {
                dbJob.status = 'Failed';
                await dbJob.save();
                if (io) io.emit('jobUpdate', dbJob);
            } else {
                throw error; // ✅ Allow retry to be triggered
            }
        }

        await dbJob.save();
        if (io) io.emit('jobUpdate', dbJob);
    }, { connection });

    // ✅ Handle Permanent Job Failure
    worker.on('failed', async (job, err) => {
        console.error(`❌ Job ${job.id} failed permanently after ${job.opts.attempts} attempts:`, err.message);

        let dbJob = await Job.findOne({ where: { customId: job.id } });
        if (dbJob) {
            dbJob.status = 'Failed';
            await dbJob.save();
            if (io) io.emit('jobUpdate', dbJob);
        }
    });

    // ✅ Handle Successful Job Completion
    worker.on('completed', async (job) => {
        console.log(`✅ Job ${job.id} completed successfully`);

        let dbJob = await Job.findOne({ where: { customId: job.id } });
        if (dbJob) {
            dbJob.status = 'Completed';
            await dbJob.save();

            // ✅ Ensure Transaction is Logged Only Once
            const existingCompleted = await Transaction.findOne({
                where: { jobId: dbJob.id, status: 'Completed' }
            });

            if (!existingCompleted) {
                await Transaction.create({
                    jobId: dbJob.id,
                    customId: dbJob.customId,
                    status: 'Completed',
                    errorMessage: null,
                    timestamp: new Date(),
                });
            }

            if (io) io.emit('jobUpdate', dbJob);
        }
    });
}

export { jobQueue };

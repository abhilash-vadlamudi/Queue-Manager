import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initializeQueue } from './queue.js';
import jobRoutes from './routes/jobsRoute.js';
import transactionsRoute from './routes/transactionsRoute.js';
import { sequelize } from './database.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());

// Router Controller's
app.use('/api/jobs', jobRoutes);
app.use('/api/transactions', transactionsRoute);

// ✅ Store `io` instance globally so it can be accessed in routes
app.set('io', io);

// ✅ Ensure Database is Connected
sequelize.sync().then(() => console.log('✅ Database connected')).catch(error => {
    console.error("❌ Failed to connect to database:", error.message || error);
    process.exit(1); // Exit the process if the database connection fails
});

// ✅ Pass `io` to `initializeQueue`
initializeQueue(io);

server.listen(4315, () => console.log('✅ Backend running on port 4315')).on('error', (error) => {
    console.error("❌ Server error:", error.message || error);
    process.exit(1); // Exit if server fails to start
});

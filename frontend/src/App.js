import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { socket } from './socket';
import JobList from './components/JobList';
import TransactionsPage from './components/TransactionsPage';
import PaginationControls from './components/common/PaginationControls';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from './middleware/errorHandler';

// ✅ Import Material-UI Components
import { AppBar, Toolbar, Typography, Container, Card, CardContent, Stack, Box } from '@mui/material';

function App() {
    const [jobs, setJobs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchJobs();

        socket.on('jobUpdate', (updatedJob) => {
            if (!updatedJob || !updatedJob.id) return;
            setJobs(prevJobs => {
                const jobExists = prevJobs.some(job => job.id === updatedJob.id);
                return jobExists
                    ? prevJobs.map(job => (job.id === updatedJob.id ? updatedJob : job))
                    : [...prevJobs, updatedJob];
            });
        });

        return () => socket.off('jobUpdate');
    }, [page, rowsPerPage]);

    async function fetchJobs() {
        try {
            const { data } = await api.get(`/api/jobs?page=${page}&limit=${rowsPerPage}`);
            setJobs(data.jobs);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error('❌ Error fetching jobs:', error);
        }
    }

    async function addJob() {
        try {
            await api.post(`/api/jobs`);
            console.log("✅ Job Added");
            fetchJobs();
        } catch (error) {
            console.error('❌ Error adding job:', error);
        }
    }

    return (
        <Router>
            {/* 🏆 Top Navigation Bar */}
            <AppBar position="static" sx={{ backgroundColor: "#1976d2", padding: "8px 0" }}>
                <Toolbar>
                    <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: "bold", color: "#fff" }}>
                        📊 Job Tracker
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ marginTop: 3 }}>
                <ToastContainer position="top-right" autoClose={3000} />
                <Routes>
                    {/* Home Page - Show Jobs */}
                    <Route path="/" element={
                        <Stack spacing={3} alignItems="center">
                            
                            {/* ℹ️ How It Works (Side Info Box) */}
                            <Card sx={{ backgroundColor: "#f9f9f9", boxShadow: 0, padding: "15px", textAlign: "center", borderRadius: 2, maxWidth: "600px" }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" color="primary">
                                        How It Works
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Click <strong>"Add Job"</strong> to create a job. Jobs will process automatically with <strong>up to 3 retries</strong> on failure.
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* 📊 Job Summary */}
                            <Stack direction="row" spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
                                <Typography variant="body1" color="primary">
                                    📊 Total Jobs: <strong>{jobs.length}</strong>
                                </Typography>
                                <Typography variant="body1" color="orange">
                                    ⏳ Pending: <strong>{jobs.filter(job => job.status === 'Pending').length}</strong>
                                </Typography>
                                <Typography variant="body1" color="green">
                                    ✅ Completed: <strong>{jobs.filter(job => job.status === 'Completed').length}</strong>
                                </Typography>
                                <Typography variant="body1" color="red">
                                    ❌ Failed: <strong>{jobs.filter(job => job.status === 'Failed').length}</strong>
                                </Typography>
                            </Stack>

                            {/* Pagination & Add Job */}
                            <PaginationControls
                                page={page}
                                totalPages={totalPages}
                                rowsPerPage={rowsPerPage}
                                setPage={setPage}
                                setRowsPerPage={setRowsPerPage}
                                addJob={addJob}
                            />

                            {/* 📝 Job List or No Jobs Message */}
                            {jobs.length === 0 ? (
                                <Stack spacing={2} alignItems="center" sx={{ textAlign: "center", marginTop: 3 }}>
                                    <Typography variant="h6" color="textSecondary">
                                        🚀 No jobs yet! Click "Add Job" to start.
                                    </Typography>
                                </Stack>
                            ) : (
                                <JobList jobs={jobs} />
                            )}
                        </Stack>
                    } />

                    {/* Transactions Page - Show transactions for a specific job */}
                    <Route path="/jobs/:jobId" element={<TransactionsPage />} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;

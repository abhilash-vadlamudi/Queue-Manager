import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, Typography, TableRow, Paper, Chip } from '@mui/material';

function JobList({ jobs }) {
    const navigate = useNavigate(); // ✅ Hook for navigation

    if (!Array.isArray(jobs)) {
        console.error("❌ JobList received invalid data:", jobs);
        return <p style={{ color: 'red', textAlign: 'center' }}>Error loading jobs.</p>;
    }

    return (
        <TableContainer component={Paper} sx={{ marginTop: 2, boxShadow: 2, borderRadius: 2 }}>
            <Table>
                <TableHead sx={{ backgroundColor: '#eef2f7' }}>
                    <TableRow>
                        <TableCell align="center"><strong>ID</strong></TableCell>
                        <TableCell align="center"><strong>Custom ID</strong></TableCell>
                        <TableCell align="center"><strong>Status</strong></TableCell>
                        <TableCell align="center"><strong>Retries</strong></TableCell>
                        <TableCell align="center"><strong>Last Attempt</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {jobs.map((job, index) => (
                        job && job.id ? (
                            <TableRow
                                key={job.id}
                                hover
                                sx={{
                                    cursor: 'pointer',
                                    transition: "background 0.2s",
                                    backgroundColor: index % 2 === 0 ? "#fafafa" : "#ffffff", // Alternate row colors
                                    "&:hover": { backgroundColor: "#f0f7ff" } // Subtle hover effect
                                }}
                                onClick={() => navigate(`/jobs/${job.id}`)}
                            >
                                <TableCell align="center">{job.id}</TableCell>
                                <TableCell align="center">{job.customId}</TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={job.status || 'Pending'}
                                        color={
                                            job.status === 'Completed' ? "success" :
                                                job.status === 'Failed' ? "error" :
                                                    "warning"
                                        }
                                        sx={{ fontWeight: "bold" }}
                                    />
                                </TableCell>
                                <TableCell align="center">{job.retries || 0}</TableCell>
                                <TableCell align="center">
                                    {job.lastAttempt ? new Date(job.lastAttempt).toLocaleString() : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ) : null
                    ))}
                </TableBody>
            </Table>
        </TableContainer>

    );
}

export default JobList;

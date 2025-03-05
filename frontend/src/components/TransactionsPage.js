import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import api from '../middleware/errorHandler'; // Import the centralized API handler

function TransactionsPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        api.get(`/api/transactions/${jobId}`)
            .then(res => setTransactions(res.data))
            .catch(error => {
                console.error('❌ Error fetching transactions:', error)
            });
    }, [jobId]);

    return (
        <Container maxWidth="md" sx={{ marginTop: 4 }}>
            <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                Transactions for Job {jobId}
            </Typography>

            <Button onClick={() => navigate('/')} variant="contained" sx={{ marginBottom: 2 }}>
                Back to Jobs
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Custom Id</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Error Message</TableCell>
                            <TableCell>Timestamp</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((tx, index) => (
                            <TableRow key={index}>
                                <TableCell>{tx.customId}</TableCell>
                                <TableCell>{tx.status}</TableCell>
                                <TableCell>{tx.errorMessage || "N/A"}</TableCell>
                                <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}

export default TransactionsPage;

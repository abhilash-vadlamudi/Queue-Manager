import React from 'react';
import { Stack, Pagination, FormControl, Typography, Select, MenuItem, Button } from '@mui/material';

function PaginationControls({ page, totalPages, rowsPerPage, setPage, setRowsPerPage, addJob }) {
    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            sx={{ marginBottom: 2, paddingX: 2 }}
        >
            {/* Rows Per Page Selection */}
            <Stack direction="row" alignItems="center" spacing={1}>
                {/* Label "Rows" to the left */}
                <Typography variant="body2" fontWeight="bold" color="textSecondary">
                    Rows
                </Typography>

                {/* Dropdown for selecting number of rows */}
                <FormControl sx={{ minWidth: 100 }}>
                    <Select
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(e.target.value)}
                        sx={{ backgroundColor: "#ffffff", borderRadius: 2 }}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                    </Select>
                </FormControl>
            </Stack>


            {/* Pagination */}
            <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="medium"
            />

            {/* Add Job Button (Now on the right) */}
            <Button variant="contained" color="primary" onClick={addJob} size="large">
                Add Job
            </Button>
        </Stack>
    );
}

export default PaginationControls;

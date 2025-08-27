// TransactionHistory.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { fetchTransactionHistory, deleteTransaction } from './api';

require('dotenv').config();

// marquee for long messages
const marqueeAnimation = keyframes`
  0%   { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

const TransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactionHistory();
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        setTransactions(parsed);
        setFilteredTransactions(parsed);
      } catch (err) {
        console.error('Failed to fetch transaction history:', err);
        setError('Failed to load transaction history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  const searchTransactions = () => {
    const term = searchTerm.toLowerCase();
    const safe = (v) => (v ? String(v).toLowerCase() : '');
    const filtered = transactions.filter((t) =>
      safe(t.receiving_user).includes(term) ||
      safe(t.sending_user).includes(term) ||
      safe(t.message).includes(term) ||
      safe(t.amount).includes(term)
    );
    setFilteredTransactions(filtered);
  };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    searchTransactions();
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilteredTransactions(transactions);
  };

  const sortTransactions = (rows) => {
    const sorted = [...rows].sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'amount':
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case 'username':
          aValue = String(a.receiving_user || '').toLowerCase();
          bValue = String(b.receiving_user || '').toLowerCase();
          break;
        case 'status':
          aValue = String(a.status || '').toLowerCase();
          bValue = String(b.status || '').toLowerCase();
          break;
        case 'type':
          aValue = String(a.transaction_type || '').toLowerCase();
          bValue = String(b.transaction_type || '').toLowerCase();
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const transactionsToDisplay = sortTransactions(filteredTransactions);

  const exportToCSV = () => {
    const headers = ['Amount', 'From', 'To', 'Message', 'Type', 'Date', 'Time', 'Status'];
    const rows = transactionsToDisplay.map((t) => [
      t.amount,
      t.sending_user,
      t.receiving_user,
      t.message,
      t.transaction_type,
      t.created_at.slice(0, 10),
      t.created_at.slice(11, 19),
      t.status,
    ]);

    const csv =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = 'transactions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (transactionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteTransaction(transactionId);
      const tx = transactions.filter((t) => t.id !== transactionId);
      const fx = filteredTransactions.filter((t) => t.id !== transactionId);
      setTransactions(tx);
      setFilteredTransactions(fx);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      setError('Failed to delete transaction. Please try again later.');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Transaction History
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Review, search, and export your activity
        </Typography>
      </Box>

      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          border: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
        }}
      >
        {/* Controls */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'center',
            mb: 2,
          }}
        >
          <TextField
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: { xs: '1 1 100%', md: '0 1 320px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Chip
            label={`${transactionsToDisplay.length} result${transactionsToDisplay.length === 1 ? '' : 's'}`}
            variant="outlined"
            color="primary"
          />
          <Select
            value={sortOrder}
            size="small"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
          <Select
            value={sortBy}
            size="small"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="amount">Amount</MenuItem>
            <MenuItem value="username">Username</MenuItem>
            <MenuItem value="type">Type</MenuItem>
            <MenuItem value="status">Status</MenuItem>
          </Select>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
              Search
            </Button>
            <Button onClick={handleReset} variant="text" sx={{ textTransform: 'none' }}>
              Reset
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ textTransform: 'none' }}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

        {/* Scrollable Table */}
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: { xs: 360, md: 480 },
            overflowY: 'auto',
            borderRadius: 1,
          }}
        >
          <Table stickyHeader>
            <TableHead
              sx={{
                '& .MuiTableCell-stickyHeader': {
                  backgroundColor: (theme) => theme.palette.background.paper + ' !important',
                  fontWeight: 600,
                },
              }}
            >
              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell sx={{ width: { xs: 80, md: 140 } }}>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                transactionsToDisplay.map((t) => (
                  <TableRow
                    key={t.id}
                    onClick={() => setSelectedRow(t.id)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor:
                        selectedRow === t.id ? 'rgba(33,150,243,0.06)' : 'inherit',
                      '&:hover': { backgroundColor: 'rgba(33,150,243,0.04)' },
                    }}
                  >
                    <TableCell>₡{t.amount}</TableCell>
                    <TableCell sx={{ width: { xs: 80, md: 140 } }}>{t.sending_user}</TableCell>
                    <TableCell>{t.receiving_user}</TableCell>
                    <TableCell>
                      <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap', width: { xs: 160, md: 260 } }}>
                        <Box sx={{ display: 'inline-block', animation: `${marqueeAnimation} 20s linear infinite` }}>
                          {t.message}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{t.transaction_type}</TableCell>
                    <TableCell>{t.created_at.slice(0, 10)}</TableCell>
                    <TableCell>{t.created_at.slice(11, 19)}</TableCell>
                    <TableCell>{t.status}</TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Delete">
                        <IconButton onClick={(e) => handleDelete(t.id, e)} size="small">
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && transactionsToDisplay.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default TransactionHistory;

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
  Modal, // Added Modal
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { fetchTransactionHistory, deleteTransaction } from './api';

// require('dotenv').config(); // This line is for backend code and unnecessary here.

// marquee for long messages
const marqueeAnimation = keyframes`
  0%   { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

// Helper component for the modal
const DetailsModal = ({ transaction, open, handleClose }) => {
  if (!transaction) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper sx={{
        p: 4,
        width: { xs: '90%', md: '500px' },
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" component="h2" mb={2}>
          Transaction Details
        </Typography>
        <Typography variant="body1"><strong>ID:</strong> {transaction.id}</Typography>
        <Typography variant="body1"><strong>Amount:</strong> ${parseFloat(transaction.amount).toFixed(2)}</Typography>
        <Typography variant="body1"><strong>Type:</strong> {transaction.transaction_type}</Typography>
        <Typography variant="body1"><strong>From:</strong> {transaction.sending_user}</Typography>
        <Typography variant="body1"><strong>To:</strong> {transaction.receiving_user}</Typography>
        <Typography variant="body1"><strong>Date:</strong> {new Date(transaction.created_at).toLocaleString()}</Typography>
        <Typography variant="body1"><strong>Status:</strong> {transaction.status}</Typography>
        <Typography variant="body1" mt={2}><strong>Message:</strong></Typography>
        <Box sx={{
          p: 1,
          border: '1px solid #ddd',
          borderRadius: 1,
          mt: 1,
        }}>
          <Typography variant="body2">{transaction.message || 'No message provided.'}</Typography>
        </Box>
      </Paper>
    </Modal>
  );
};

const TransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state for modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
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
              Export
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="transaction history table">
            <TableHead>
              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell>Transaction Party</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: 'red' }}>
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && transactionsToDisplay.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No transactions found.</TableCell>
                </TableRow>
              )}
              {transactionsToDisplay.map((t) => (
                <TableRow
                  key={t.id}
                  hover
                  onClick={() => handleRowClick(t)}
                  sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    ${parseFloat(t.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        From: {t.sending_user}
                      </Typography>
                      <Typography variant="body2">
                        To: {t.receiving_user}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{t.transaction_type}</TableCell>
                  <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete Transaction">
                      <IconButton
                        color="error"
                        onClick={(e) => handleDelete(t.id, e)}
                        size="small"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Transaction Details Modal */}
      <DetailsModal
        transaction={selectedTransaction}
        open={showDetailsModal}
        handleClose={() => setShowDetailsModal(false)}
      />
    </Box>
  );
};

export default TransactionHistory;

// ReloadWallet.js (restyled)
require('dotenv').config();
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Select, MenuItem, Button, TextField, Snackbar,
  Chip, InputAdornment, FormControl, FormLabel, CircularProgress, Divider
} from '@mui/material';
import { CreditCard, CurrencyBitcoin, Payments, AccountBalanceWallet } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchWalletData } from './api';

const ReloadWallet = () => {
  const [amount, setAmount] = useState(10000);         // used by crypto/cashapp
  const [purchaseAmount, setPurchaseAmount] = useState('20'); // used by stripe/coinbase
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchWalletData();
        setWalletData(data);
      } catch (err) {
        setSnackbarMessage('Failed to load wallet data. Please try again.');
        setOpenSnackbar(true);
        setTimeout(() => navigate('/'), 1000);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [navigate]);

  const goToCheckOut = () => {
    if (paymentMethod === 'stripe') {
      navigate(`/stripe-checkout?amount=${purchaseAmount}`);
    } else if (paymentMethod === 'crypto') {
      navigate(`/crypto-checkout?amount=${amount}`);
    } else if (paymentMethod === 'cashapp') {
      navigate(`/cashapp-checkout?amount=${amount}`);
    } else if (paymentMethod === 'coinbase') {
      navigate(`/coinbase-checkout?amount=${purchaseAmount * 1000}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    goToCheckOut();
    setSnackbarMessage('Redirecting to checkout…');
    setOpenSnackbar(true);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Reload Wallet
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Buy coins quickly and securely
        </Typography>
      </Box>

      {/* Summary */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, border: '1px solid #e9ecef', backgroundColor: '#f8f9fa', borderRadius: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`Balance: ₡${walletData?.balance ?? 0}`} />
            <Chip color="primary" variant="outlined" label={`Spendable: ₡${walletData?.spendable ?? 0}`} />
          </Box>
        )}
      </Paper>

      {/* Form */}
      <Paper component="form" onSubmit={handleSubmit}
        sx={{ p: { xs: 2, md: 3 }, border: '1px solid #e9ecef', backgroundColor: '#fff', borderRadius: 2 }}>
        <FormControl fullWidth>
          <FormLabel sx={{ mb: 1 }}>Payment method</FormLabel>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            size="small"
            sx={{ mb: 2, maxWidth: 320 }}
          >
            <MenuItem value="stripe"><CreditCard sx={{ mr: 1 }} /> Stripe</MenuItem>
            <MenuItem value="coinbase"><CurrencyBitcoin sx={{ mr: 1 }} /> Coinbase</MenuItem>
            <MenuItem value="crypto"><CurrencyBitcoin sx={{ mr: 1 }} /> Crypto (manual)</MenuItem>
            <MenuItem value="cashapp"><Payments sx={{ mr: 1 }} /> Cash App</MenuItem>
          </Select>
        </FormControl>

        {/* Amount controls (kept exactly by method) */}
        {paymentMethod === 'crypto' && (
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: '100', step: '1' }}
            InputProps={{ startAdornment: <InputAdornment position="start">₡</InputAdornment> }}
            sx={{ maxWidth: 360 }}
          />
        )}

        {paymentMethod === 'cashapp' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: 360 }}>
            <Button variant="outlined" onClick={() => setAmount((p) => Number(p) - 1)}>-</Button>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: '5', step: '0.5' }}
              InputProps={{ startAdornment: <InputAdornment position="start">₡</InputAdornment> }}
            />
            <Button variant="outlined" onClick={() => setAmount((p) => Number(p) + 1)}>+</Button>
          </Box>
        )}

        {(paymentMethod === 'stripe' || paymentMethod === 'coinbase') && (
          <FormControl sx={{ mt: 1 }}>
            <FormLabel sx={{ mb: 1 }}>Choose a package</FormLabel>
            <Select
              value={purchaseAmount}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              size="small"
              sx={{ maxWidth: 260 }}
            >
              <MenuItem value="3">$3 → 3,000 coins</MenuItem>
              <MenuItem value="5">$5 → 5,000 coins</MenuItem>
              <MenuItem value="10">$10 → 10,000 coins</MenuItem>
              <MenuItem value="20">$20 → 20,000 coins</MenuItem>
              <MenuItem value="50">$50 → 50,000 coins</MenuItem>
              <MenuItem value="100">$100 → 100,000 coins</MenuItem>
            </Select>
          </FormControl>
        )}

        <Divider sx={{ my: 2 }} />
        <Button type="submit" variant="contained" size="large" sx={{ textTransform: 'none' }}>
          Continue to checkout
        </Button>
      </Paper>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnackbar}
        autoHideDuration={2500}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default ReloadWallet;

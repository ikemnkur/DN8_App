require('dotenv').config();
import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  FormLabel,
  Box,
  Snackbar,
  IconButton,
  Chip
} from '@mui/material';
import { CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import Icon from '@mui/material/Icon';
import { Add, Remove } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchWalletData, walletConvertAction } from './api';
import Dashboard from './Dashboard';

const ConvertWallet = () => {
  const [amount, setAmount] = useState(1000);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userdata')) || {});
  const [walletData, setWalletData] = useState(null);
  const [fee, setFee] = useState(0);
  const [convertMethod, setConvertMethod] = useState('spend');
  const [otherMethod, setOtherMethod] = useState('redeem');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Load wallet data
  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWalletData();
      setWalletData(data);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data. Please try again.');
      setTimeout(() => navigate('/'), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate fee whenever amount or convertMethod changes
  useEffect(() => {
    if (convertMethod === "spend") {
      setFee(Math.floor(amount * 0.05));
    }
    if (convertMethod === "redeem") {
      setFee(Math.floor(amount * 0.1));
    }
  }, [amount, convertMethod]);

  // Prepare conversion data
  const conversionData = {
    username: userData.username,
    amount: amount,
    email: userData.email,
    firstname: userData.firstName,
    lastname: userData.lastName,
    date: new Date().toISOString(),
    fees: fee,
    balance: walletData?.balance,
    method: convertMethod,
    dashboardData: JSON.parse(localStorage.getItem('dashboardData')) || {},
  };

  async function convertCoins() {
    const response = await walletConvertAction(conversionData);
    console.log('Conversion response:', response);
    console.log(`${amount} coins have been converted to ${convertMethod}!`);
    setOpenSnackbar(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  }

  useEffect(() => {
    loadWalletData();
  }, []);

  // Handle the main form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount < 250) {
      alert("Minimum conversion amount is 250 Coins");
      return;
    }

    convertCoins();
    // Optionally reset amount if you want:
    setAmount('');
  };

  // Helpers for adjusting amount
  const handleDecrement = () => {
    setAmount((prev) => Math.max(0, Number(prev) - 25)); // Prevent negative values
  };

  const handleIncrement = () => {
    setAmount((prev) => Number(prev) + 25);
  };

  return (
    <Box
      sx={{
        // display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        // background: '#f4f6f8',
        p: 2,
      }}
    >
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
          Convert Coins
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Move coins between Spendable and Redeemable
        </Typography>
      </Box>


      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Paper sx={{ p: 4, maxWidth: 600, width: '100%', borderRadius: 2, boxShadow: 3, }}>
          <Typography variant="h4" align="center" gutterBottom>
            Convert Coin Balance
          </Typography>
          <form onSubmit={handleSubmit}>
            {/* {!isLoading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Current Balance: ₡{walletData?.balance}
                </Typography>
                <Typography variant="body1">
                  Spendable: ₡{walletData?.spendable}
                </Typography>
                <Typography variant="body1">
                  Redeemable: ₡{walletData?.redeemable}
                </Typography>
              </Box>
            )} */}

            {/* Summary */}
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, border: '1px solid #e9ecef', backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip label={`Total Balance: ₡${(walletData?.spendable ?? 0) + (walletData?.redeemable ?? 0)}`} />
                  <Chip color="primary" variant="outlined" label={`Spendable: ₡${walletData?.spendable ?? 0}`} />
                  <Chip color="secondary" variant="outlined" label={`Redeemable: ₡${walletData?.redeemable ?? 0}`} />
                </Box>
              )}
            </Paper>

            {/* Conversion Method */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel>
                <Typography variant="h6" textAlign={'center'} sx={{ mb: 1 }}>
                  Conversion Method: {convertMethod.charAt(0).toUpperCase() + convertMethod.slice(1)}
                </Typography>
              </FormLabel>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Button
                  variant={convertMethod === 'redeem' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setConvertMethod("redeem");
                    setOtherMethod("spend");
                  }}
                  sx={{ flex: 1, mx: 0.5 }}
                >
                  Spendable ➜ Redeemable
                </Button>
                <Button
                  variant={convertMethod === 'spend' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setConvertMethod("spend");
                    setOtherMethod("redeem");
                  }}
                  sx={{ flex: 1, mx: 0.5 }}
                >
                  Redeemable ➜ Spendable
                </Button>
              </Box>
            </FormControl>

            {/* Amount Selection */}
            <Box sx={{ mb: 3 }}>
              <FormLabel>
                <Typography variant="subtitle1" textAlign={'center'}>
                  Amount of {otherMethod}able coins to convert to {convertMethod}able coins:
                </Typography>
              </FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <IconButton
                  onClick={handleDecrement}
                  sx={{ border: '1px solid #ccc' }}
                >
                  <Remove />
                </IconButton>
                <TextField
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  inputProps={{ min: '5', step: '0.5', style: { textAlign: 'center' } }}
                  sx={{ mx: 1, flex: 1 }}
                />
                <IconButton
                  onClick={handleIncrement}
                  sx={{ border: '1px solid #ccc' }}
                >
                  <Add />
                </IconButton>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Fee (Coins): ₡{fee}
              </Typography>
            </Box>

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>
              Convert Coins
            </Button>
          </form>
        </Paper>
      </Box>


      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={`${amount} coins have been converted to ${convertMethod}!`}
      />
    </Box>
  );
};

export default ConvertWallet;
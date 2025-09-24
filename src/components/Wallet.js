// Wallet.js (styled to match SendMoney/Dashboard)
require('dotenv').config();
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Paper,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import { fetchWalletData } from './api';
import ShareWallet from './ShareWallet';
import AdAudioObject from '../pages/AdAudioObject';
import AdVideoObject from '../pages/AdVideoObject';

const Wallet = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [action, setAction] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData] = useState(JSON.parse(localStorage.getItem('userdata')));
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState(Math.random() > 0.5 ? "donor" : "reciever"); 

  const tiers = [
    { id: 1, name: 'Basic', limit: 100, fee: 0 },
    { id: 2, name: 'Standard', limit: 500, fee: 5 },
    { id: 3, name: 'Premium', limit: 1000, fee: 10 },
    { id: 4, name: 'Gold', limit: 5000, fee: 20 },
    { id: 5, name: 'Platinum', limit: 10000, fee: 35 },
    { id: 6, name: 'Diamond', limit: 50000, fee: 50 },
    { id: 7, name: 'Ultimate', limit: 100000, fee: 75 },
  ];

  const cardSx = {
    p: { xs: 2, sm: 2.5 },
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: 2,
    boxShadow: 'none',
  };

  const fmt = (n) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
      Number.isFinite(+n) ? +n : 0
    );

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        setIsLoading(true);
        const ud = JSON.parse(localStorage.getItem('userdata'));
        const data = await fetchWalletData(ud);
        setWalletData(data);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load wallet data. Please try again.');
        setTimeout(() => navigate('/'), 1000);
      } finally {
        setIsLoading(false);
      }
    };
    loadWalletData();
  }, [navigate]);

  const handleOpenDialog = (selectedAction) => {
    // Navigate directly (keeps your existing behavior)
    if (selectedAction === 'reload') navigate('/reload');
    else if (selectedAction === 'withdraw') navigate('/withdraw');
    else navigate('/convert');
  };

  const handleCloseDialog = () => setOpenDialog(false);
  const handleConfirm = () => {
    setOpenDialog(false);
    if (action === 'reload') navigate('/reload');
    else if (action === 'withdraw') navigate('/withdraw');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1.5, sm: 2 } }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const spendable = Number(walletData?.spendable ?? 0);
  const redeemable = Number(walletData?.redeemable ?? 0);
  const total = spendable + redeemable;
  const tierIdx = (userData?.accountTier || 1) - 1;
  const tierName = tiers[tierIdx]?.name || 'Basic';

  const spendablePct = total > 0 ? Math.min(100, Math.max(0, (spendable / total) * 100)) : 0;
  const redeemablePct = total > 0 ? Math.min(100, Math.max(0, (redeemable / total) * 100)) : 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1.5, sm: 2 } }}>
      {/* Gradient header to match other pages */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #bff321ff 30%, #bff321ff 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
          }}
        >
          Wallet
        </Typography>
        <Typography variant="h6" color="text.secondary">
          View your balance and manage coins
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {/* Wallet Overview */}
        <Grid item xs={12} md={7}>
          <Paper sx={cardSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              {/* <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Overview
              </Typography> */}
              <Chip label={`Tier: ${tierName}`} color="primary" size="small" />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Current Balance
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              ₡{fmt(total)}
            </Typography>
            {accountType == 1 && (
              <div>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 1.25, borderRadius: 1.5, border: '1px solid #f4c50bff', boxShadow: 'none' }}>
                      <Typography variant="caption" color="text.secondary">
                        Pending Credits from Donations
                      </Typography>
                      <Typography variant="h6">₡{fmt(spendable)}</Typography>
                      <LinearProgress variant="determinate" value={spendablePct} sx={{ height: 8, borderRadius: 1, mt: 0.75 }} />
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 1.25, borderRadius: 1.5, border: '1px solid #f4c50bff', boxShadow: 'none' }}>
                      <Typography variant="caption" color="text.secondary">
                        Credits Available for Redeeming
                      </Typography>
                      <Typography variant="h6">₡{fmt(redeemable)}</Typography>
                      <LinearProgress variant="determinate" value={redeemablePct} sx={{ height: 8, borderRadius: 1, mt: 0.75 }} />
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="body2" color="text.secondary">
                  Limits & Fees (Tier {tiers[tierIdx]?.id || 1})
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
                  <Chip
                    label={`Daily limit: ₡${fmt(tiers[tierIdx]?.limit ?? 0)}`}
                    size="small"
                    variant="outlined"
                    color="default"
                  />
                  <Chip
                    label={`Fee: ₡${fmt(tiers[tierIdx]?.fee ?? 0)}`}
                    size="small"
                    variant="outlined"
                    color="default"
                  />
                </Box>
              </div>
            )

            }

          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={5}>
          <Paper sx={cardSx}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Choose an action to manage your coins
            </Typography>

            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleOpenDialog('reload')}
                  sx={{ textTransform: 'none', fontWeight: 600, py: 1.25 }}
                >
                  Reload Wallet
                </Button>
              </Grid>
              {/* <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"          // replaces invalid color="tertiary"
                  onClick={() => handleOpenDialog('convert')}
                  sx={{ textTransform: 'none', fontWeight: 600, py: 1.25 }}
                >
                  Convert Coins
                </Button>
              </Grid> */}
              <Grid item xs={12}>
                <Button
                  fullWidth
                  color="secondary"
                  variant="contained"
                  onClick={() => handleOpenDialog('withdraw')}
                  sx={{ textTransform: 'none', fontWeight: 600, py: 1.25 }}
                >
                  Withdraw Coins
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>



        {/* <Grid item xs={12}>
          <ShareWallet walletData={walletData} /> 
        </Grid> */}
      </Grid>

      {/* (Optional) Dialog if you later want confirmation flow */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{action === 'reload' ? 'Reload Wallet' : 'Withdraw Funds'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {action === 'reload' ? 'reload your wallet' : 'withdraw funds'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirm} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Wallet;

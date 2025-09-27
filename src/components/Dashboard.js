// Dashboard.js (updated styling + mobile-friendly layout to match SendMoney)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material';
import { fetchDashboardData, fetchUserProfile } from './api';
import Notifications from './Notifications';
import AdVideoObject from '../pages/AdVideoObject';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    birthDate: '',
    encryptionKey: '',
    accountTier: 1,
    profilePicture: null
  });
  const [tier, setTier] = useState(1);
  const navigate = useNavigate();

  // Helpers
  const formatCoins = (n) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
      Number.isFinite(+n) ? +n : 0
    );

  const safeRatio = (num, den) => {
    const n = Number.isFinite(+num) ? +num : 0;
    const d = Number.isFinite(+den) && +den > 0 ? +den : 1;
    const r = Math.min(100, Math.max(0, (n / d) * 100));
    return r;
  };

  const tiers = [
    { id: 1, name: 'Basic', limit: 100, fee: 0 },
    { id: 2, name: 'Standard', limit: 500, fee: 5 },
    { id: 3, name: 'Premium', limit: 1000, fee: 10 },
    { id: 4, name: 'Gold', limit: 5000, fee: 20 },
    { id: 5, name: 'Platinum', limit: 10000, fee: 35 },
    { id: 6, name: 'Diamond', limit: 50000, fee: 50 },
    { id: 7, name: 'Ultimate', limit: 100000, fee: 75 },
  ];
  const currentTier = tiers.find(t => t.id === tier) || tiers[0];



  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profileRes = await fetchUserProfile();
        setProfile(profileRes);

        const updatedUserData = {
          ...profileRes,
          birthDate: profileRes.birthDate ? profileRes.birthDate.split('T')[0] : '',
        };

        setUserData(updatedUserData);
        localStorage.setItem('userdata', JSON.stringify(updatedUserData));

        setTier(parseInt(profileRes.accountTier));
      } catch (err) {
        console.error('DashBrdPG - Error fetching user profile:', err);
        setSnackbarMessage(err.response?.data?.message || 'Failed to load user profile, refresh page or login again');
        setOpenSnackbar(true);
        if (err.response?.status === 401) {
          setTimeout(() => navigate('/login'), 500);
        }
      }
    };

    loadUserProfile();
  }, [navigate]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        localStorage.setItem('dashboardData', JSON.stringify(data));
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load dashboard data, Please Re-Login');
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Derived amounts
  const spendable = Number(dashboardData?.spendable ?? 0);
  const redeemable = Number(dashboardData?.redeemable ?? 0);
  const totalBalance = spendable + redeemable;

  const sentTimes = Number(dashboardData?.sentTransactions ?? 0);
  const recvTimes = Number(dashboardData?.receivedTransactions ?? 0);
  const dailyTxLimit = Number(dashboardData?.dailyLimit ?? 0);

  const sent24h = Number(dashboardData?.totalAmountSentLast24Hours ?? 0);
  const recv24h = Number(dashboardData?.totalAmountReceivedLast24Hours ?? 0);
  const dailyCoinLimit = Number(dashboardData?.dailyCoinLimit ?? 0);

  const cardSx = {
    p: { xs: 2, sm: 2.5 },
     background: 'linear-gradient(45deg, #2a2b27ff 30%, #393c1aff 90%)',
    border: '2px solid #e6cd0aff',
    borderRadius: 2,

    boxShadow: 'none',
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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1.5, sm: 2 } }}>
      {/* Gradient Header (matches SendMoney style) */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #e2f321ff 30%, #d2e31aff 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Overview of your wallet and activity
        </Typography>
      </Box>
{/* 
      <Grid container spacing={2.5}> */}
        {/* Wallet Overview */}
        {/* <Grid item xs={12} sm={6} md={4}> */} 
          <Paper sx={cardSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Wallet
              </Typography>
              <Chip label={`Tier: ${tiers[tier-1].name || 1}`} sx={{ color: 'black', fontSize: '0.75rem', background: 'linear-gradient(45deg, #e2f321ff 30%, #d2e31aff 90%)' }} size="small" />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Current total balance
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              ₡{formatCoins(totalBalance)}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
              <Paper sx={{ p: 1.25, borderRadius: 1.5, border: '1px solid #e9ecef', boxShadow: 'none' }}>
                <Typography variant="caption" color="text.secondary">Spendable</Typography>
                <Typography variant="h6">₡{formatCoins(spendable)}</Typography>
              </Paper>
              <Paper sx={{ p: 1.25, borderRadius: 1.5, border: '1px solid #e9ecef', boxShadow: 'none' }}>
                <Typography variant="caption" color="text.secondary">Redeemable</Typography>
                <Typography variant="h6">₡{formatCoins(redeemable)}</Typography>
              </Paper>
            </Box>

            <Box sx={{  gap: 1.5, mb: 2 }}>
            <Paper sx={cardSx}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Transaction Limits (Today)
              </Typography>

              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Times Sent: {sentTimes} / {dailyTxLimit || '—'}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={safeRatio(sentTimes, dailyTxLimit)}
                sx={{ height: 8, borderRadius: 1, mb: 1.5 }}
              />

              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Times Received: {recvTimes} / {dailyTxLimit || '—'}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={safeRatio(recvTimes, dailyTxLimit)}
                sx={{ height: 8, borderRadius: 1 }}
              />
           
             
            </Paper>

            </Box>


            <Box sx={{  gap: 1.5, mb: 2 }}>
            <Paper sx={cardSx}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Last 24 Hours
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6">Sent: ₡{formatCoins(sent24h)}</Typography>
                <Typography variant="h6" color="text.secondary">
                  limit: ₡{formatCoins(dailyCoinLimit || 0)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={safeRatio(sent24h, dailyCoinLimit)}
                sx={{ height: 8, borderRadius: 1, mb: 1.5 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="h6">Received: ₡{formatCoins(recv24h)}</Typography>
                <Typography variant="h6" color="text.secondary">
                  limit: ₡{formatCoins(dailyCoinLimit || 0)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={safeRatio(recv24h, dailyCoinLimit)}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Paper>
            </Box>

            {/* <Paper sx={{ ...cardSx, textAlign: 'center' }}> */}
               <Alert severity="info" sx={{ bgcolor: '#23231fff', borderColor: '#b3d4fc' }}>
                Note: Transaction and coin limits reset every 24 hours. Upgrade your account tier for higher limits.
              </Alert>
            {/* </Paper> */}
          </Paper>
        {/* </Grid> */}


      {/* </Grid> */}

      {/* Notifications below the cards */}
      <Box sx={{ mt: 2.5 }}>
        <Notifications />
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default Dashboard;

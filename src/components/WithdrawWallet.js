require('dotenv').config();
import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Snackbar,
  chipClasses,

  Chip
} from '@mui/material';
import {
  Divider, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, fetchWalletData, walletWithdrawAction } from './api';
import { lightBlue } from '@mui/material/colors';


const WithdrawWallet = () => {
  // const [amount, setAmount] = useState('');
  // const [withdrawMethod, setWithdrawMethod] = useState('XMR');
  // const [extraFormData, setExtraFormData] = useState({});
  // const [walletData, setWalletData] = useState(null);
  // const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userdata')) || {});
  // const [rates, setRates] = useState({});
  // const [fees] = useState({ XMR: 0.02, BTC: 0.02, ETH: 0.02, LTC: 0.02, SOL: 0.02, Bank: 1.5, Paypal: 1.0, Sendwave: 1.0, Check: 2.0 }); // example; keep yours
  // const [minWithdraw] = useState({ XMR: 1, BTC: 1, ETH: 1, LTC: 1, SOL: 1, Bank: 50, Paypal: 25, Sendwave: 25, Check: 100 }); // example; keep yours
  // const [server_cost] = useState({ XMR: 0.0, BTC: 0.0, ETH: 0.0, LTC: 0.0, SOL: 0.0, Bank: 0.05, Paypal: 0.03, Sendwave: 0.03, Check: 0.08 }); // example; keep yours
  // const [waitTimes] = useState({ XMR: '≈30–60 min', BTC: '≈30–60 min', ETH: '≈30–60 min', LTC: '≈15–45 min', SOL: '≈5–20 min', Bank: '1–3 business days', Paypal: 'Instant–24h', Sendwave: 'Instant–24h', Check: '5–10 business days' });
  // const [methodNames] = useState({ XMR: 'Monero', BTC: 'Bitcoin', ETH: 'Ethereum', LTC: 'Litecoin', SOL: 'Solana', Bank: 'Bank Transfer', Paypal: 'PayPal', Sendwave: 'Sendwave', Check: 'Check' });

  // const [openSnackbar, setOpenSnackbar] = useState(false);
  // const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  // const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('Bank');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userdata')) || {});
  const [walletData, setWalletData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [extraFormData, setExtraFormData] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Withdrawal configurations
  const [rates, setRates] = useState({
    USD: 1000, // 1000 coins = 1 USD
    XMR: 0,
    LTC: 0,
    BTC: 0,
    ETH: 0,
    SOL: 0,
    Ticket: 250,
    Amazon: 1100,
    Walmart: 1150,
    Target: 1125,
  });

  const minWithdraw = {
    USD: 25,
    XMR: 2.5,
    LTC: 5,
    BTC: 20,
    ETH: 10,
    SOL: 5,
    Ticket: 1,
    Amazon: 5,
    Walmart: 10,
    Target: 10,
    Paypal: 10,
    SendWave: 12.5,
    Bank: 50,
    Check: 25,
  };

  const fees = {
    USD: 500,
    XMR: 100,
    LTC: 150,
    BTC: 500,
    ETH: 250,
    SOL: 200,
    Amazon: 400,
    Walmart: 500,
    Target: 450,
    Paypal: 300,
    SendWave: 500,
    Bank: 750,
    Ticket: 0,
  };

  const server_cost = {
    USD: 0.05,
    XMR: 0.01,
    LTC: 0.01,
    BTC: 0.025,
    ETH: 0.02,
    SOL: 0.02,
    Amazon: 0.02,
    Walmart: 0.02,
    Target: 0.02,
    Ticket: 0.005,
    Paypal: 0.05,
    Bank: 0.075,
    SendWave: 0.05,
  };

  const waitTimes = {
    USD: '2 days',
    XMR: '3-6 hrs',
    LTC: '1-6 hrs',
    BTC: '2-6 hrs',
    ETH: '1-6 hrs',
    SOL: '3-6 hrs',
    Amazon: '12 hrs',
    Walmart: '24 hrs',
    Ticket: '5 mins',
    Bank: '1 Week',
    Paypal: '1 Day',
    SendWave: '12 hours',
  };

  const methodNames = {
    USD: 'USD Dollar',
    XMR: 'Crypto: Monero',
    LTC: 'Crypto: Litecoin',
    BTC: 'Crypto: Bitcoin',
    ETH: 'Crypto: Ethereum',
    SOL: 'Crypto: Solana',
    Amazon: 'US Dollar worth of Amazon Gift Cards',
    Walmart: 'US Dollar worth of Walmart Gift Cards',
    Target: 'US Dollar worth of Target Gift Cards',
    Ticket: 'Prize Raffle Ticket(s)',
    Check: 'US Check via Mail',
    Paypal: 'Via PayPal Account',
    SendWave: 'Get money via SendWave',
    Bank: 'send coins via Bank',
  };

  // rates (kept from your file)
  const fetchCryptoRateData = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=monero,litecoin,bitcoin,ethereum,solana&vs_currencies=usd');
      const data = await response.json();
      setRates((prev) => ({
        ...prev,
        XMR: data.monero.usd * 1000,
        LTC: data.litecoin.usd * 1000,
        BTC: data.bitcoin.usd * 1000,
        ETH: data.ethereum.usd * 1000,
        SOL: data.solana.usd * 1000,
      }));
    } catch (e) {
      console.error('Error fetching crypto rates:', e);
    } finally {
      setIsLoadingRates(false);
    }
  };

  useEffect(() => { fetchCryptoRateData(); }, []);
  // Derived values based on selected withdrawal method and amount
  const rate = rates[withdrawMethod] || 0;
  const min = minWithdraw[withdrawMethod] * 1000 || 0;
  const fee = fees[withdrawMethod] || 0;
  const serverCostPercentage = server_cost[withdrawMethod] || 0;
  const feeFlat = fees[withdrawMethod] || 0;
  const serverPct = server_cost[withdrawMethod] || 0;
  const time = waitTimes[withdrawMethod] || '';
  const amountNum = parseFloat(amount) || 0;
  const serverCost = serverCostPercentage * amountNum;
  const totalCost = parseFloat(fee) + parseFloat(serverCost) + parseFloat(amount) || 0;

  // Fetch user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await fetchUserProfile();

        const updatedUserData = {
          ...profile,
          birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
          accountTier: profile.accountTier || 1,
          encryptionKey: profile.encryptionKey || '',
        };

        setUserData(updatedUserData);
        localStorage.setItem('userdata', JSON.stringify(updatedUserData));
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setSnackbarMessage(
          error.response?.data?.message || 'Failed to load user profile. Please refresh or log in again.'
        );
        setOpenSnackbar(true);
        navigate('/login'); // Redirect to login if unauthorized
      }
    };

    loadUserProfile();
  }, [navigate]);

  // Load wallet data
  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      setIsLoadingWallet(true);
      const data = await fetchWalletData();
      setWalletData(data);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data. Please try again.');
      setSnackbarMessage('Failed to load wallet data.');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/'), 1000);
    } finally {
      setIsLoading(false);
      setIsLoadingWallet(false);
    }
  };

  // Fetch wallet data on component mount
  useEffect(() => {


    loadWalletData();
  }, [navigate]);



  const createNotification = async (notificationData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(API_URL + '/notifications/create', notificationData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("New notification: ", notificationData.message)
      // Optionally, update the notifications state or refetch notifications
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Check if amount meets the minimum withdrawal requirement
    if (amountNum < min) {
      setSnackbarMessage(`Minimum withdrawal amount for ${methodNames[withdrawMethod]} is ${min} coins.`);
      setOpenSnackbar(true);
      return;
    }

    // Prepare withdrawal data
    const withdrawData = {
      username: userData.username,
      amount: amountNum,
      email: userData.email,
      firstname: userData.firstName,
      lastname: userData.lastName,
      date: new Date().toISOString(),
      currency: withdrawMethod === 'USD' ? 'USD' : withdrawMethod,
      rate: rate,
      minWithdraw: min,
      fees: fee,
      serverCost: serverCost,
      balance: walletData?.balance,
      waitTime: time,
      method: withdrawMethod,
      extraData: extraFormData,
    };

    // Call the withdrawal function
    await makeWithdraw(withdrawData);
    setAmount('');
    setExtraFormData({});
  };

  // Handle withdrawal request
  const makeWithdraw = async (withdrawData) => {
    try {
      // Optionally, you can set a loading state here
      await walletWithdrawAction(withdrawData);
      setSnackbarMessage('Withdrawal request submitted successfully.');
      setOpenSnackbar(true);
      // Optionally, navigate to another page or refresh wallet data
      await loadWalletData();
      const notif = {
        type: 'withdrawl-order',
        recipient_user_id: userData.user_id,
        message: `You have made withdraw order of ₡${amount} coins via ${withdrawMethod}.`,
        from_user: 0,
        date: new Date(),
        recipient_username: userData.username
      }

      // createNotification(notif)

    } catch (err) {
      console.error('Error processing withdrawal:', err);
      setSnackbarMessage(
        err.response?.data?.message || 'Failed to process withdrawal. Please try again later.'
      );
      setOpenSnackbar(true);
    }
  };

  // Function to update extra form data
  const updateExtraFormData = (field, value) => {
    setExtraFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Render additional form fields based on withdrawal method
  const renderExtraFields = () => {
    switch (withdrawMethod) {
      case 'XMR':
      case 'SOL':
      case 'LTC':
      case 'BTC':
      case 'ETH':
        return (
          <TextField
            label="Crypto Address"
            fullWidth
            margin="normal"
            value={extraFormData.cryptoAddress || ''}
            onChange={(e) => updateExtraFormData('cryptoAddress', e.target.value)}
            required
          />
        );
      case 'Amazon':
      case 'Walmart':
      case 'Target':
        return (
          <TextField
            label="Country"
            fullWidth
            margin="normal"
            select
            value={extraFormData.country || ''}
            onChange={(e) => updateExtraFormData('country', e.target.value)}
            required
          >
            <MenuItem value="USA">USA</MenuItem>
            <MenuItem value="UK">UK</MenuItem>
            <MenuItem value="CAN">Canada</MenuItem>
            <MenuItem value="AUS">Australia</MenuItem>
            <MenuItem value="MEX">Mexico</MenuItem>
            <MenuItem value="ESP">Spain</MenuItem>
            <MenuItem value="FRN">France</MenuItem>
            {/* Add more countries as needed */}
          </TextField>
        );
      case 'Ticket':
        // Assuming tickets don't require extra info
        return null;
      case 'Bank':
        return (
          <>
            <TextField
              label="Bank Account Number"
              fullWidth
              margin="normal"
              value={extraFormData.bankAccountNumber || ''}
              onChange={(e) => updateExtraFormData('bankAccountNumber', e.target.value)}
              required
            />
            <TextField
              label="Routing Number"
              fullWidth
              margin="normal"
              value={extraFormData.routingNumber || ''}
              onChange={(e) => updateExtraFormData('routingNumber', e.target.value)}
              required
            />
            <TextField
              label="Bank Name"
              fullWidth
              margin="normal"
              value={extraFormData.bankName || ''}
              onChange={(e) => updateExtraFormData('bankName', e.target.value)}
              required
            />
          </>
        );
      case 'Paypal':
        return (
          <TextField
            label="PayPal Email"
            fullWidth
            margin="normal"
            type="email"
            value={extraFormData.paypalEmail || ''}
            onChange={(e) => updateExtraFormData('paypalEmail', e.target.value)}
            required
          />
        );
      case 'Sendwave':
        return (
          <TextField
            label="Sendwave Email"
            fullWidth
            margin="normal"
            type="email"
            value={extraFormData.paypalEmail || ''}
            onChange={(e) => updateExtraFormData('sendwaveEmail', e.target.value)}
            required
          />

        );
      case 'Check':
        return (
          <>
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={extraFormData.fullName || ''}
              onChange={(e) => updateExtraFormData('fullName', e.target.value)}
              required
            />
            <TextField
              label="Mailing Address"
              fullWidth
              margin="normal"
              value={extraFormData.mailingAddress || ''}
              onChange={(e) => updateExtraFormData('mailingAddress', e.target.value)}
              required
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, minWidth: 600, margin: 'auto', padding: 2 }}>
      {/* <Typography variant="h4" gutterBottom>
        Redeem Clout Coins
      </Typography>
      {!isLoading && walletData && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Current Redeemable Balance: ₡{walletData.redeemable}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Account Tier: {userData.accountTier}
          </Typography>
    
        </Box>
      )} */}

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
          Withdraw / Redeem
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Cash out your coins via your preferred method
        </Typography>
      </Box>
      

      {/* Balances */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, border: '1px solid #e9ecef', backgroundColor: '#f8f9fa', borderRadius: 2 }}>
        {(isLoadingWallet || isLoadingRates) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`Redeemable: ₡${walletData?.redeemable ?? 0}`} />
            <Chip variant="outlined" label={`Spendable: ₡${walletData?.spendable ?? 0}`} />
            <Chip variant="outlined" label={`Tier: ${userData?.accountTier ?? '-'}`} />
          </Box>
        )}
      </Paper>


      <Paper sx={{ p: 2 }} style={{ backgroundColor: '#f1f3f5ff' }}>
        <Typography variant="h6" gutterBottom>
          Withdrawal: {amount}C ~ {(amount * 0.001).toFixed(2)} $USD{' '}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Amount"
            fullWidth
            margin="normal"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            inputProps={{ min: '0.01', step: '0.01' }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Withdrawal Method</InputLabel>
            <Select
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
              label="Withdrawal Method"
            >
              <MenuItem value="XMR">Crypto: Monero</MenuItem>
              <MenuItem value="SOL">Crypto: Solana</MenuItem>
              <MenuItem value="LTC">Crypto: Litecoin</MenuItem>
              <MenuItem value="ETH">Crypto: Ethereum</MenuItem>
              <MenuItem value="BTC">Crypto: Bitcoin</MenuItem>
              <MenuItem value="Amazon">Amazon Gift Card</MenuItem>
              <MenuItem value="Walmart">Walmart Gift Card</MenuItem>
              <MenuItem value="Target">Target Gift Card</MenuItem>
              <MenuItem value="Ticket">Prize Raffle Tickets</MenuItem>
              <MenuItem value="Bank">Bank Transfer</MenuItem>
              <MenuItem value="Paypal">PayPal</MenuItem>
              <MenuItem value="Sendwave">Sendwave</MenuItem>
              <MenuItem value="Check">Check by Mail (U.S Only)</MenuItem>
            </Select>
          </FormControl>

          {/* Render additional fields based on withdrawal method */}
          {renderExtraFields()}

          {/* Display Derived Values */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Minimum Withdraw: {min} Coins
            </Typography>
            <Typography variant="h5" gutterBottom>
              Rate: {rate} Coins = 1 {methodNames[withdrawMethod]}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Estimated Wait Time: {time}
            </Typography>


          </Box>
          {/* Cost + Info */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            <Chip variant="outlined" label={`Rate: ${rate ? `₡${rate}/$` : '—'}`} />
            <Chip variant="outlined" label={`Flat Fee: ${feeFlat}`} />
            <Chip variant="outlined" label={`Server: ${Math.round(serverPct * 100)}%`} />
            <Chip color="warning" label={`Min: ₡${min}`} />
            {time && <Chip label={`ETA: ${time}`} />}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box style={{ backgroundColor: "#EEEEFF", padding: "5px" }}>

            <Typography variant="h6" gutterBottom>
              Amount: {amount} Coins
            </Typography>
            <Typography variant="h6" gutterBottom>
              Fees: {fee} Coins
            </Typography>
            <Typography variant="h6" gutterBottom>
              Server Cost: {Math.round(serverCost)} Coins
            </Typography>
            <Typography variant="h5" gutterBottom>
              Total Cost: {Math.round(totalCost)} Coins
            </Typography>
          </Box>


          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={isLoading || amountNum < min || isNaN(amountNum) || amount > parseInt(userData.balance)}
          >
            {isLoading ? 'Processing...' : 'Request Withdrawal'}
          </Button>
        </form>
      </Paper>
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

export default WithdrawWallet;

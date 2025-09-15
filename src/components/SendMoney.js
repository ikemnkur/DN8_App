require('dotenv').config();
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Snackbar,
  Avatar,
  Alert,
  InputAdornment,
  Fade,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Person,
  Search,
  Send,
  Visibility
} from '@mui/icons-material';
import { fetchUserProfile, fetchOtherUserProfile, sendMoneyToOtherUser } from './api';
import axios from 'axios';
import { useAuthCheck } from './useAuthCheck';
import AdVideoObject from '../pages/AdVideoObject';

const SendMoney = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [toUser, setToUser] = useState(null);
  const [UserNotFound, setUserNotFound] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("userdata")));
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const usernameInputRef = useRef(null);
  useAuthCheck();

  const API_URL = process.env.REACT_APP_API_SERVER_URL + '/api';

  useEffect(() => {
    let ud = JSON.parse(localStorage.getItem("userdata"))
    console.log("this user data: ", ud)
    setUserData(ud)

    const searchParams = new URLSearchParams(location.search);
    const recipientFromUrl = searchParams.get('recipient');
    const amountFromUrl = searchParams.get('amount');

    if (recipientFromUrl) setRecipient(recipientFromUrl);
    if (amountFromUrl) setAmount(amountFromUrl);

    console.log("recipient from url: ", recipientFromUrl)
    loadUserProfile();

    if (recipientFromUrl !== null)
      setTimeout(() => {
        search4user(null, recipientFromUrl)
      }, 50);

  }, [userId, location.search]);

  const loadUserProfile = async () => {
    if (userId) {
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
        console.error('Error fetching toUser profile:', error);
        setSnackbarMessage('Failed to load toUser profile');
        setOpenSnackbar(true);
        if (error.response?.status === 403) {
          setTimeout(() => navigate('/'), 1000);
        }
      }
      console.log("User ID: ", userId);
      console.log("toUser Data: ", toUser);
    }
  };

  const search4user = async (e, user2search) => {
    setSearching(true);
    let term = user2search;
    if (term == null)
      term = recipient;

    console.log("Search Term: ", term)
    try {
      const s4uData = await fetchOtherUserProfile(term);
      setTimeout(() => {
        console.log("Searching 4 User: ", s4uData)
        setToUser(s4uData);
        setSearching(false);
      }, 100)
      setUserNotFound(false)
    } catch (error) {
      setUserNotFound(true)
      setSearching(false);
      setTimeout(() => {
        setUserNotFound(false)
      }, 3000);
      console.error(`Error fetching ${term} profile:`, error);
      setSnackbarMessage(`Failed to find User: ${term}`);
      setOpenSnackbar(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    console.log('Sending', amount, 'to', recipient);
    try {
      const sendmoneyData = {
        recipient: recipient,
        recipientId: toUser.user_id,
        recipientUsername: toUser.username,
        sendingUsername: userData.username,
        sendingId: userData.user_id,
        amount: parseFloat(amount),
        message: message
      };
      await sendMoneyToOtherUser(sendmoneyData);
      setSnackbarMessage("Money sent successfully!");
      setOpenSnackbar(true);

      // Reset form
      setRecipient('');
      setAmount('');
      setMessage('');
      setToUser(null);

      const notif = {
        type: 'money_received',
        recipient_user_id: toUser.user_id,
        message: `You received ₡${amount} from ${userData.username}.`,
        from_user: userData.user_id,
        date: new Date(),
        recipient_username: toUser.username
      }

      createNotification(notif)
      setSending(false);

    } catch (error) {
      setSending(false);
      setSnackbarMessage(error.message || "Failed to send coins. Please try again later.");
      setOpenSnackbar(true);
    }
  };

  const createNotification = async (notificationData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(API_URL + '/notifications/create', notificationData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("New notification: ", notificationData.message)
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const goToUserProfile = (e) => {
    navigate(`/user/${toUser.username}`)
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Send Coins
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Transfer coins to other users securely
        </Typography>
      </Box>

      {/* User Not Found Alert */}
      <Fade in={UserNotFound}>
        <Box sx={{ mb: 2 }}>
          {UserNotFound && (
            <Alert severity="error" sx={{ borderRadius: 1 }}>
              Username "{recipient}" was not found in the database.
            </Alert>
          )}
        </Box>
      </Fade>

      {/* User Profile Display */}
      <Fade in={!!toUser}>
        <Box sx={{ mb: 2 }}>
          {toUser && (
            <Paper sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef'
            }}>
              <Avatar
                src={toUser.profilePic || toUser.avatar}
                alt={toUser.username}
                sx={{
                  width: 80,
                  height: 80,
                  border: '2px solid #1976d2'
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                  {toUser.username}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Bio: {toUser.bio || "No bio available."}
                </Typography>
              </Box>
              <Button
                onClick={goToUserProfile}
                variant="contained"
                startIcon={<Visibility />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                View Profile
              </Button>
            </Paper>
          )}
        </Box>
      </Fade>

      {/* Send Money Form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Recipient Search Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Find Recipient
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="Recipient Username"
                fullWidth
                value={recipient}
                ref={usernameInputRef}
                onChange={(e) => { setRecipient(e.target.value) }}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                onClick={search4user}
                variant="contained"
                disabled={searching || !recipient.trim()}
                startIcon={searching ? <CircularProgress size={16} /> : <Search />}
                sx={{
                  minWidth: 120,
                  minHeight: 48,
                  textTransform: 'none'
                }}
              >
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Transaction Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Transaction Details
            </Typography>

            <TextField
              label="Amount"
              fullWidth
              margin="normal"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              inputProps={{ min: "0.01", step: "0.01" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography color="primary" sx={{ fontWeight: 600 }}>
                      ₡
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Leave a Message"
              fullWidth
              margin="normal"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              multiline
              rows={3}
              placeholder="Enter a message for the recipient..."
            />
          </Box>


          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={sending || !toUser || !amount || !message}
            startIcon={sending ? <CircularProgress size={20} /> : <Send />}
            sx={{
              mt: 2,
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            {sending ? 'Sending Coins...' : 'Send Coins'}
          </Button>
        </form>
      </Paper>

      {/* Advertisement Section */}
      {userData.accountTier < 4 && (
        <Box sx={{ mt: 4 }}>
          <AdVideoObject
            onAdView={(ad) => console.log('Ad viewed:', ad)}
            onAdClick={(ad) => console.log('Ad clicked:', ad)}
            onAdSkip={(ad) => console.log('Ad skipped:', ad)}
            onRewardClaim={(ad, amount) => console.log('Reward claimed:', amount)}
            RewardModal={({ onClose, onReward }) => (
              <div style={{ /* simple modal styles */ }}>
                <button onClick={() => onReward(5)}>Claim 5 Credits</button>
                <button onClick={onClose}>Close</button>
              </div>
            )}
            // style={{ borderRadius: 0 }}
            showRewardProbability={0.3} // 30% chance to show reward button
            filters={{ format: 'regular', mediaFormat: 'video' }} // Only show modal ads for this placement
            style={{
              minHeight: '240px', // Ensure minimum height
              maxHeight: '400px', // Limit maximum height
              borderRadius: 0 // Remove border radius to fit Paper container
            }}
            className="modal-ad"
          />
        </Box>
      )}

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

export default SendMoney;
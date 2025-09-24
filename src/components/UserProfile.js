// UserProfile.js (restyled to match the app theme)
require('dotenv').config();
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Button,
  Avatar,
  Paper,
  Box,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Rating
} from '@mui/material';
import {
  Send as SendIcon,
  PictureAsPdfOutlined as PictureIcon,
  Favorite as FavoriteIcon,
  Report as ReportIcon,
  Message as MessageIcon,
  Star as StarIcon,
  ThumbUpRounded,
  PictureInPicture
} from '@mui/icons-material';
import {
  fetchOtherUserProfile,
  fetchOtherUserProfileId,
  fetchUserProfile,
  updateFavoriteStatus,
  submitUserReport,
  submitUserMessage
} from './api';

const UserProfile = () => {
  const { userId } = useParams();
  console.log('UserProfile for userid_or_username:', userId);
  const [userid_or_username, setUserid_or_Username] = useState(userId);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const cardSx = {
    p: { xs: 2, sm: 2.5 },
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: 2,
    boxShadow: 'none',
  };

  // timestamp helper (kept from your code)
  const convertTimestamp = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hour = date.getHours();
    let meridiem = 'AM';
    if (hour === 0) hour = 12;
    else if (hour === 12) meridiem = 'PM';
    else if (hour > 12) { hour -= 12; meridiem = 'PM'; }
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} at ${String(hour).padStart(2, '0')}:${minutes}:${seconds} ${meridiem}`;
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        let userData = await fetchOtherUserProfileId(userid_or_username);
        if (userData?.created_at) userData.created_at = convertTimestamp(userData.created_at);
        setUser(userData);
        setIsFavorite(!!userData.isFavorite);
        setUserRating(Number(userData.avgRating || 0));
      } catch (error) {
        // fallback to username
        try {
          const userData = await fetchOtherUserProfile(userid_or_username);
          if (userData?.created_at) userData.created_at = convertTimestamp(userData.created_at);
          setUser(userData);
          setIsFavorite(!!userData.isFavorite);
          setUserRating(Number(userData.avgRating || 0));
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setSnackbarMessage('Failed to load user profile.');
          setOpenSnackbar(true);
          if (err?.response?.status === 403) setTimeout(() => navigate('/dashboard'), 1000);
        }
      } finally {
        setLoading(false);
      }
    };

    const checkLoginStatus = () => {
      try {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
    loadUserProfile();
  }, [userid_or_username, navigate]);

  const handleSendMoney = () => {
    if (!user?.username) return;
    navigate(`/send?recipient=${user.username}`);
  };

  const handleViewingUserPosts = () => {
    if (!user?.username) return;
    navigate(`/user-posts/${user.username}`);
  };

  const handleSupport = () => {
    if (!user?.username) return;
    navigate(`/donate/${user.username}`);
  };

  const handleToggleFavorite = async () => {
    if (!user) return;
    try {
      const newFavoriteStatus = !isFavorite;
      await updateFavoriteStatus(userid_or_username, newFavoriteStatus, user);
      setIsFavorite(newFavoriteStatus);
      setSnackbarMessage(newFavoriteStatus ? 'User added to favorites' : 'User removed from favorites');
      setOpenSnackbar(true);

      // refresh cached current user profile in localStorage (kept from your code)
      const profile = await fetchUserProfile();
      const updatedUserData = {
        ...profile,
        birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
        accountTier: profile.accountTier || 1,
        encryptionKey: profile.encryptionKey || '',
      };
      localStorage.setItem('userdata', JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Error updating favorite status:', error);
      setSnackbarMessage('Failed to update favorite status');
      setOpenSnackbar(true);
    }
  };

  const handleReport = () => setOpenReportDialog(true);

  const handleSubmitReport = async () => {
    if (!window.confirm('Are you sure you want to report this user? This will cost you 10 coins.')) return;

    if (!reportMessage) {
      setSnackbarMessage('Please provide a reason for reporting');
      setOpenSnackbar(true);
      return;
    }
    if (reportMessage.length < 10) {
      setSnackbarMessage('Report message must be at least 10 characters long');
      setOpenSnackbar(true);
      return;
    }
    if (reportMessage.length > 500) {
      setSnackbarMessage('Report message cannot exceed 500 characters');
      setOpenSnackbar(true);
      return;
    }
    try {
      const reportedUser = user?.username;
      const reportingUser = localStorage.getItem('username');
      await submitUserReport(userid_or_username, reportMessage, reportedUser, reportingUser);
      setOpenReportDialog(false);
      setReportMessage('');
      setSnackbarMessage('Report submitted successfully');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error submitting report:', error);
      setSnackbarMessage('Failed to submit report');
      setOpenSnackbar(true);
    }
  };

  const handleMessage = () => {
    if (!user?.username) return;
    navigate(`/messages/${user.username}`);
    // Or use the dialog: setOpenMessageDialog(true);
  };

  const handleSubmitMessage = async () => {
    try {
      await submitUserMessage(userid_or_username, userMessage);
      setOpenMessageDialog(false);
      setUserMessage('');
      setSnackbarMessage('Message sent successfully');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error sending message:', error);
      setSnackbarMessage('Failed to send message');
      setOpenSnackbar(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return <Typography sx={{ p: 2 }}>User not found.</Typography>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1.5, sm: 2 } }}>
      {/* Gradient Header */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
          }}
        >
          {user.username}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Member since {user.created_at || '—'}
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {/* Left: Profile summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={cardSx}>

            <>
              {/* <Divider sx={{ my: 1.5 }} /> */}
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Profile: <span style={(user.accountTier > 2) ? { color: 'Blue' } : { color: 'Gray' }}>{(user.accountTier > 2) ? "Verified" : 'Basic'}</span></Typography>
            </>

            {/* <Divider sx={{ my: 1.5 }} /> */}

            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={user.profilePic || user.avatar}
                alt={user.username}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 1.5,
                  border: '2px solid',
                  borderColor: 'primary.light',
                }}
              />


              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* Stats */}
            {/* <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
              <Chip
                icon={<StarIcon />}
                label={`Rating: ${Number(user.avgRating || 0).toFixed(1)}`}
                variant="outlined"
              />
              <Chip
                icon={<ThumbUpRounded />}
                label={`Likes Received: ${user.numberOfLikes ?? 0}`}
                variant="outlined"
              />
              <Chip
                icon={<PictureInPicture />}
                label={`Posts Created: ${user.numberOfPosts ?? 0}`}
                variant="outlined"
              />
              <Chip
                icon={<FavoriteIcon />}
                label={`Favorites Received: ${user.numberOfFavorites ?? 0}`}
                variant="outlined"
              />
            </Box> */}

            {user.bio && (
              <>
                {/* <Divider sx={{ my: 1.5 }} /> */}
                <Typography variant="subtitle1" color="text.secondary">Bio</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {user.bio}
                </Typography>
              </>
            )}

            {(user.country && user.city) && (
              <>
                {/* <Divider sx={{ my: 1.5 }} /> */}
                <Typography variant="subtitle1" color="text.secondary">Location</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {user.country}, {user.state}, {user.city}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        {/* Right: Actions + details */}
        <Grid item xs={12} md={8}>
          {/* Actions */}
          <Paper sx={{ ...cardSx, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={1.25}>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PictureIcon />}
                  onClick={handleViewingUserPosts}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  View Posted Causes
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleSendMoney}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Send Coins
                </Button>
              </Grid>
              {/* <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant={isFavorite ? 'contained' : 'outlined'}
                  startIcon={<FavoriteIcon />}
                  onClick={handleToggleFavorite}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                </Button>
              </Grid> */}
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ReportIcon />}
                  onClick={handleReport}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Report
                </Button>
              </Grid>
              {/* <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  onClick={handleMessage}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Message
                </Button>
              </Grid> */}
            </Grid>
          </Paper>


          <Paper sx={{ ...cardSx, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Info & Promo
            </Typography>
            <Grid container spacing={1.25}>
              {/* <Grid item xs={12} sm={6} md={4}></Grid> */}
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    position: 'relative',
                    paddingBottom: '56.25%',
                    height: 0,
                    overflow: 'hidden',
                    mt: 2,
                  }}
                >
                  <iframe
                    ref={howToVideoRef}
                    src="https://www.youtube.com/embed/Q_KxEMxn2pc"
                    title="How-to Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  ></iframe>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ReportIcon />}
                  onClick={handleSupport}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Support
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Users Stats block - Redesigned for clarity */}
          <Paper sx={cardSx}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
              📊 Community Statistics
            </Typography>

            {/* Grid layout for better organization */}
            <Grid container spacing={2}>
              {/* Community Rating */}
              <Grid item xs={12}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  p: 2.5,
                  color: 'white',
                  textAlign: 'center',
                  mb: 2
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                    ⭐ Community Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                    <Rating
                      value={userRating}
                      precision={0.5}
                      readOnly
                      sx={{
                        '& .MuiRating-iconFilled': { color: '#ffd700' },
                        '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.3)' }
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', ml: 1 }}>
                      {Number(user.avgRating || 0).toFixed(1)}/5
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Based on {user.numberOfRatings ?? 0} rating{(user.numberOfRatings || 0) === 1 ? '' : 's'}
                  </Typography>
                </Box>
              </Grid>

              {/* Stats Grid */}
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  border: '2px solid #e3f2fd',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                  height: '100%'
                }}>
                  <Typography variant="h5" sx={{
                    fontSize: '2rem',
                    mb: 1,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                  }}>
                    🔓
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                    Unlocks
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                    {Math.ceil(user.totalUnlocks ?? 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg: {Number((user.totalUnlocks / user.numberOfPosts) || 0).toFixed(1)} per post
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{
                  border: '2px solid #f3e5f5',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%)',
                  height: '100%'
                }}>
                  <Typography variant="h5" sx={{
                    fontSize: '2rem',
                    mb: 1,
                    background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                  }}>
                    👁️
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', mb: 0.5 }}>
                    Views
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                    {Math.ceil(user.totalViews ?? 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg: {Number((user.totalViews / user.numberOfPosts) || 0).toFixed(1)} per post
                  </Typography>
                </Box>
              </Grid>

              {/* Likes vs Dislikes - Full width comparison */}
              <Grid item xs={12}>
                <Box sx={{
                  border: '2px solid #e8f5e8',
                  borderRadius: 2,
                  p: 2.5,
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #fff3e0 100%)'
                }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    textAlign: 'center',
                    mb: 2,
                    color: 'text.primary'
                  }}>
                    👍 Community Engagement
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    {/* Likes */}
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Box sx={{
                        background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                        borderRadius: '50%',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1,
                        color: 'white'
                      }}>
                        <Typography variant="h5">👍</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {user.totalLikes ?? 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Likes
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Avg: {Number((user.totalLikes / user.numberOfPosts) || 0).toFixed(1)}
                      </Typography>
                    </Box>

                    {/* VS Divider */}
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      mx: 2
                    }}>
                      <Typography variant="body2" sx={{
                        fontWeight: 'bold',
                        color: 'text.secondary',
                        background: 'rgba(0,0,0,0.05)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}>
                        VS
                      </Typography>
                    </Box>

                    {/* Dislikes */}
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Box sx={{
                        background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
                        borderRadius: '50%',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1,
                        color: 'white'
                      }}>
                        <Typography variant="h5">👎</Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {user.totalDislikes ?? 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Dislikes
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Avg: {Number((user.totalDislikes / user.numberOfPosts) || 0).toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Engagement ratio */}
                  <Box sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Engagement Ratio: {
                        (user.totalLikes + user.totalDislikes) > 0
                          ? `${Math.round((user.totalLikes / (user.totalLikes + user.totalDislikes)) * 100)}% positive`
                          : 'No engagement yet'
                      }
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />

      {/* Report Dialog */}
      <Dialog
        open={openReportDialog}
        onClose={() => setOpenReportDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Report User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for report"
            type="text"
            fullWidth
            multiline
            rows={6}
            value={reportMessage}
            onChange={(e) => setReportMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitReport} variant="contained">Submit Report</Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog (kept if you want modal messaging instead of redirect) */}
      <Dialog
        open={openMessageDialog}
        onClose={() => setOpenMessageDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Send a Message to {user.username}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message to user"
            type="text"
            fullWidth
            multiline
            rows={8}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMessageDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitMessage} variant="contained" color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;

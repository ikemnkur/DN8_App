// AccountPage.js (restyled to match SendMoney/Dashboard)
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Paper,
  Box,
  TextField,
  Avatar,
  Grid,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  PhotoCamera,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, updateUserProfile, fetchWalletData, uploadProfilePicture } from './api';
import { useAuthCheck } from './useAuthCheck';
import axios from 'axios';
import { Autocomplete } from '@mui/material';
import moment from 'moment-timezone';
// import AdVideoObject from '../pages/AdVideoComponent';
import AdVideoObject from '../pages/AdVideoObject';
import { uploadMediaFiles } from './api';

const API_URL = process.env.REACT_APP_API_SERVER_URL + '/api';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Organized time zones with region grouping and offset information
const organizeTimeZones = () => {
  const allTimeZones = moment.tz.names();
  const groupedTimeZones = allTimeZones.reduce((acc, tz) => {
    const now = moment().tz(tz);
    const offset = now.format('Z');
    const region = tz.split('/')[0];
    if (!acc[region]) acc[region] = [];
    acc[region].push({
      value: tz,
      label: `(${offset}) ${tz.replace('_', ' ')}`,
      offset: now.utcOffset()
    });
    return acc;
  }, {});
  Object.keys(groupedTimeZones).forEach(region => {
    groupedTimeZones[region].sort((a, b) => a.offset - b.offset);
  });
  const flatTimeZones = [];
  Object.keys(groupedTimeZones).sort().forEach(region => {
    flatTimeZones.push({ value: region, label: region, isGroupHeader: true });
    flatTimeZones.push(...groupedTimeZones[region]);
  });
  return flatTimeZones;
};
const timeZoneOptions = organizeTimeZones();

// Account tier information
const tierInfo = {
  1: { name: 'Basic', features: ['Limited access', '5 entries per day', 'Standard support'] },
  2: { name: 'Standard', features: ['Full access', '15 entries per day', 'Priority email support'] },
  3: { name: 'Premium', features: ['Full access', 'Unlimited entries', '24/7 support', 'Advanced analytics'] },
  4: { name: 'Gold', features: ['Everything in Premium', 'API access', 'Dedicated account manager'] },
  5: { name: 'Platinum', features: ['Everything in Gold', 'Custom integrations', 'Weekly strategy calls'] },
  6: { name: 'Diamond', features: ['Everything in Platinum', 'White label options', 'Enterprise solutions'] },
  7: { name: 'Ultimate', features: ['Everything in Diamond', 'Custom development', 'Board level reporting'] }
};

const AccountPage = () => {
  useAuthCheck();

  const [userData, setUserData] = useState({
    id: '',
    user_id: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    birthDate: '',
    encryptionKey: '',
    accountTier: 1,
    profilePicture: '',
    account_id: '',
    bio: '',
    profilePictureUrl: '',
    profilePic: '',
    timeZone: '',
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // shared card style
  const cardSx = {
    p: { xs: 2, sm: 2.5 },
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: 2,
    boxShadow: 'none',
  };

  // // Save userData to localStorage whenever it changes
  // useEffect(() => {
  //   localStorage.setItem('userdata', JSON.stringify(userData));
  // }, [userData]);

  // Fetch user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        const updatedUserData = {
          ...profile,
          birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
          accountTier: profile.accountTier || 1,
          encryptionKey: profile.encryptionKey || '',
          bio: profile.bio || '',
          profilePictureUrl: profile.profilePictureUrl || '',
          profilePic: profile.profilePic || '',
          timeZone: profile.timeZone || '',
        };
        setUserData(updatedUserData);
      } catch (error) {
        console.error('AccountPG - Error fetching user profile:', error);
        setSnackbarMessage(error.response?.data?.message || 'Failed to load user profile, refresh page or login again');
        setOpenSnackbar(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserProfile();
  }, [navigate]);

  // Example function to upload file to backend:
  const uploadToBackend = async (file) => {
    const formData = new FormData();
    formData.append('media', file);

    try {
      // uploadMediaFiles should return the media link or an object with mediaLink property
      const response = await uploadProfilePicture(formData);
      console.log('Profile picture uploaded:', response);

      // If your backend returns { mediaLink: "..." }
      if (response && response.url) {
        return response.url;
      }
      // If your backend returns { mediaLink: "..." }
      if (response && response.mediaLink) {
        return response.mediaLink;
      }
      // If your backend returns the link directly
      if (typeof response === 'string') {
        return response;
      }
      throw new Error('Upload failed or invalid response');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // (Optional) Fetch wallet data
  useEffect(() => {
    const loadWalletData = async () => {
      try {
        setIsLoading(true);
        await fetchWalletData();
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setSnackbarMessage('Failed to load wallet data.');
        setOpenSnackbar(true);
        setTimeout(() => navigate('/'), 1000);
      } finally {
        setIsLoading(false);
      }
    };
    loadWalletData();
  }, [navigate]);

  // Inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeZoneChange = (_e, newValue) => {
    if (!newValue || newValue.isGroupHeader) return;
    setUserData((prev) => ({ ...prev, timeZone: newValue.value || '' }));
  };

  // Profile picture upload
  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
      setUserData((prev) => ({ ...prev, profilePicture: file }));
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('username', userData.username);
    formData.append('userId', userData.user_id || userData.id);
    formData.append('date', new Date().toISOString());

    try {
      let mediaLink;
      try {
        mediaLink = await uploadToBackend(file); // server returns { mediaLink }
        formData.append('mediaLink', mediaLink);
        console.log('Uploaded profile picture: ', mediaLink);

        // setMessage('Picture loaded-in successfully!');
        setSnackbarMessage('Uploading profile picture...');
        setOpenSnackbar(true);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        setSnackbarMessage('Failed to upload profile picture.');
        setOpenSnackbar(true);
        return;
      }
      setUserData((prev) => ({ ...prev, profilePictureUrl: mediaLink || '' }));
      setTimeout(() => {
        setSnackbarMessage('Profile picture uploaded successfully!');
      }, 1500);
    } catch (error) {
      console.error('API - Error uploading user profile image:', error);
      setSnackbarMessage('An error occurred while uploading the image.');
    } finally {
      setOpenSnackbar(true);
    }
  };

  // Tier navigation
  const handleUpgradeTier = () => {
    if (userData.accountTier < 7) {
      navigate('/upgrade-account', { state: { currentTier: userData.accountTier, nextTier: userData.accountTier + 1 } });
    } else {
      setSnackbarMessage('You are already at the highest tier!');
      setOpenSnackbar(true);
    }
  };
  const handleDowngradeTier = () => {
    if (userData.accountTier > 1) {
      navigate('/downgrade-account', { state: { currentTier: userData.accountTier, nextTier: userData.accountTier - 1 } });
    } else {
      setSnackbarMessage('You are already at the lowest tier!');
      setOpenSnackbar(true);
    }
  };

  // Delete account
  const deleteUserAccount = async () => {
    const response = await fetch('/api/delete-account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId: userData.id }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to delete account.');
    }
    return response.json();
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('userdata');
      setSnackbarMessage('Account deleted successfully.');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('AcntPG - Error deleting account:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to delete account. Please try again.');
      setOpenSnackbar(true);
      if (error.response?.status === 403) setTimeout(() => navigate('/'), 1000);
    }
    setOpenDeleteDialog(false);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userdata');
    setSnackbarMessage('Logged out successfully.');
    setOpenSnackbar(true);
    setTimeout(() => {
      navigate('/login');
      setUserData((prev) => ({
        ...prev,
        id: '', user_id: '', username: '', email: '', firstName: '', lastName: '',
        phoneNumber: '', birthDate: '', encryptionKey: '', accountTier: 1, profilePicture: '',
        bio: '', profilePictureUrl: '', profilePic: '', timeZone: '',
      }));
    }, 500);
  };

  // Time zone option render
  const renderTimeZoneOption = (props, option) => {
    if (option.isGroupHeader) {
      return (
        <Box component="li" {...props} sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', pointerEvents: 'none' }}>
          {option.label}
        </Box>
      );
    }
    return <Box component="li" {...props}>{option.label}</Box>;
  };

  const currentTimeZoneObj = timeZoneOptions.find(
    option => !option.isGroupHeader && option.value === userData.timeZone
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

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
            mb: 0.5
          }}
        >
          Account
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your profile, security, and preferences
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {/* Left column: Profile + Tier */}
        <Grid item xs={12} md={4}>
          {/* Profile Card */}
          <Paper sx={cardSx}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Profile
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar
                src={profilePicturePreview || userData.profilePictureUrl || userData.profilePic || '/default-avatar.png'}
                alt="Profile"
                sx={{ width: 100, height: 100, mx: 'auto', mb: 1.5, border: '2px solid', borderColor: 'primary.light' }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleProfilePictureChange}
              />
              <label htmlFor="profile-picture-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<PhotoCamera />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Upload Photo
                </Button>
              </label>
            </Box>

            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.75 }}>
              <Chip label={`@${userData.username || ''}`} size="small" variant="outlined" />
              <Chip label={userData.email || 'No email'} size="small" variant="outlined" />
            </Box>
          </Paper>

          {/* Tier Card */}
          <Paper sx={{ ...cardSx, mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Account Tier
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              {tierInfo[userData.accountTier]?.name || 'Basic'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
              {(tierInfo[userData.accountTier]?.features || []).slice(0, 4).map((f, i) => (
                <Chip key={i} label={f} size="small" variant="outlined" />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<ArrowUpward />}
                onClick={handleUpgradeTier}
                disabled={userData.accountTier >= 7}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Upgrade
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                startIcon={<ArrowDownward />}
                onClick={handleDowngradeTier}
                disabled={userData.accountTier <= 1}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Downgrade
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right column: Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={cardSx}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Profile Details
            </Typography>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsUpdating(true);
              try {
                const { encryptionKey, ...profileData } = userData;
                await updateUserProfile(profileData);
                setSnackbarMessage('Account updated successfully!');
                setOpenSnackbar(true);
              } catch (error) {
                console.error('AcntPG - Error updating account:', error);
                setSnackbarMessage(error.response?.data?.message || 'Failed to update account. Please try again.');
                setOpenSnackbar(true);
              } finally {
                setIsUpdating(false);
              }
            }}>
              <Grid container spacing={1.5}>
                {/* Username / Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="username"
                    label="Username"
                    disabled={isUpdating}
                    value={userData.username}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="email"
                    label="Email"
                    type="email"
                    disabled={isUpdating}
                    value={userData.email}
                    onChange={handleInputChange}
                  />
                </Grid>

                {/* First / Last */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="firstName"
                    label="First Name"
                    disabled={isUpdating}
                    value={userData.firstName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="lastName"
                    label="Last Name"
                    disabled={isUpdating}
                    value={userData.lastName}
                    onChange={handleInputChange}
                  />
                </Grid>

                {/* Phone / Birth Date */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="phoneNumber"
                    label="Phone Number"
                    disabled={isUpdating}
                    value={userData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="birthDate"
                    label="Birth Date"
                    type="date"
                    disabled={isUpdating}
                    value={userData.birthDate}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Bio */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="bio"
                    label="Biography"
                    disabled={isUpdating}
                    value={userData.bio || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                  />
                </Grid>

                {/* Encryption Key */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="encryptionKey"
                    label="Encryption Key"
                    disabled={isUpdating}
                    value={userData.encryptionKey}
                    onChange={handleInputChange}
                  />
                </Grid>

                {/* Time Zone */}
                <Grid item xs={12}>
                  <Autocomplete
                    fullWidth
                    options={timeZoneOptions}
                    value={currentTimeZoneObj || null}
                    onChange={handleTimeZoneChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Time Zone"
                        variant="outlined"
                        margin="normal"
                        helperText="Search by region, city, or UTC offset"
                      />
                    )}
                    renderOption={renderTimeZoneOption}
                    groupBy={(option) => option.isGroupHeader ? option.label : ''}
                    getOptionLabel={(option) => option.label || ''}
                    filterSelectedOptions
                    autoHighlight
                    disableListWrap
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                  />
                </Grid>
              </Grid>

              {/* Actions */}
              <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between' }}>
                <Button type="submit" variant="contained" disabled={isUpdating} sx={{ textTransform: 'none', fontWeight: 600 }}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setOpenDeleteDialog(true)}
                    disabled={isUpdating}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Delete Account
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleLogout}
                    disabled={isUpdating}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Logout
                  </Button>
                </Box>
              </Box>
            </form>
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

      {/* Delete Confirmation */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountPage;

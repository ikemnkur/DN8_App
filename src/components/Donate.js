import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, TextField, Button, Box, CircularProgress, Snackbar, Paper, Avatar,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Modal, IconButton, Grid, Rating, Divider, Card, CardContent, Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';
import axios from 'axios';
import Auth from './Auth';
import {
  LockOpenRounded, Star, ThumbDownAlt, ThumbUp, ThumbUpOutlined,
  ThumbDownAltOutlined, Visibility,
  SendOutlined
} from '@mui/icons-material';
import AdObject from '../pages/AdObject'; // Assuming you have an AdObject component
import AdAudioObject from '../pages/AdAudioObject'; // Assuming you have an AdAudioObject component


import { fetchUserProfile } from './api';

const Donate = () => {
  const { itemid } = useParams();
  const navigate = useNavigate();
  const [contentData, setContentData] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlocked, setUnlocked] = useState(false);

  // Rating prevention states
  const [hasUserRated, setHasUserRated] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Notification & Dialog states
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');

  // Maintain user profile data (make sure you include user_id)
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    birthDate: '',
    encryptionKey: '',
    accountTier: 1,
    profilePicture: null,
    user_id: null, // important for identifying the currently logged-in user
  });

  // Track likes, dislikes, views, rating, etc.
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [views, setViews] = useState(0);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userLikeStatus, setUserLikeStatus] = useState(0); // 1: liked, -1: disliked, 0: none

  // For building notification data before submission
  const [notificationData, setNotificationData] = useState(null);

  // Comments state - now managed dynamically from DB
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const API_URL = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5000';

 

  const createNotification = async (notifBody) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(API_URL + '/notifications/create-unlock', notifBody, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('New notification:', notifBody.message);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Load user profile from server
  const loadUserProfile = async () => {
    try {
      const profile = await fetchUserProfile();
      const updatedUserData = {
        ...profile,
        birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
      };
      setUserData(updatedUserData);
      localStorage.setItem('userdata', JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to load user profile. Please refresh or login again.');
      if (error.response?.status === 401) {
        setTimeout(() => navigate('/login'), 500);
      }
    }
  };

  // User initiates unlock
  const handleUnlock = () => {
    if (!isLoggedIn) {
      setOpenLoginModal(true);
      return;
    }
    if (userBalance < (contentData?.cost || 0)) {
      setSnackbarMessage('Insufficient balance. Please reload your wallet.');
      return;
    }
    setOpenDialog(true);
  };

  // Confirm unlock after user sees the dialog
  const confirmUnlock = async () => {
    try {
      const token = localStorage.getItem('token');
      alert('You will need to confirm your login credentials. This helps reduce spam or abuse.');
      await axios.post(
        `${API_URL}/api/unlock/unlock-content`,
        {
          contentId: contentData.id, message: message, user_id: userData.user_id, type: 'Unlock',
          recipient_user_id: contentData.host_user_id, // The content owner's user ID
          recipient_username: contentData.host_username,
          Nmessage: `User "${userData.username}" unlocked your content "${contentData.title}" and you earned ₡${contentData.cost}.`,
          from_user: userData.user_id, // The current user's ID
          date: new Date(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnlocked(true);
      setUserBalance((prev) => prev - contentData.cost);
      setSnackbarMessage('Content unlocked successfully!');

      // Build the notification if the content has a host user
      if (contentData.host_user_id) {
        const newNotification = {
          type: 'Unlock',
          recipient_user_id: contentData.host_user_id, // The content owner's user ID
          recipient_username: contentData.host_username,
          message: `User "${userData.username}" unlocked your content "${contentData.title}" and you earned ₡${contentData.cost}.`,
          from_user: userData.user_id, // The current user's ID
          date: new Date(),
        };
        setNotificationData(newNotification);
        await createNotification(newNotification);
      }
    } catch (err) {
      setSnackbarMessage('Failed to unlock content. Please try again.');
    } finally {
      setOpenDialog(false);
    }
  };

  const renderContent = () => {
    if (!contentData) return null;
    switch (contentData.type) {
      case 'url':
        return (
          <a href={contentData.content.content} target="_blank" rel="noopener noreferrer">
            Access Content
          </a>
        );
      case 'image':
        return (
          <img
            src={contentData.content.content}
            alt={contentData.title}
            style={{ maxWidth: '100%' }}
          />
        );
      case 'text':
      case 'code':
      case 'video':
        return <Typography>{contentData.content.content}</Typography>;
      case 'file':
        return (
          <a href={contentData.content.content} download>
            Download File
          </a>
        );
      default:
        return <Typography>Content type not supported</Typography>;
    }
  };

  // Handle successful login (close login modal and refresh balance)
  const handleLoginSuccess = async () => {
    setIsLoggedIn(true);
    setOpenLoginModal(false);
    const token = localStorage.getItem('token');
    const balanceResponse = await axios.get(`${API_URL}/api/wallet`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUserBalance(balanceResponse.data.balance);
  };

  // Updated like/dislike handlers to work with the backend
  const handleLike = async () => {
    if (!isLoggedIn) {
      setOpenLoginModal(true);
      return;
    }

    // Don't allow like/dislike changes after rating submission
    if (hasUserRated) {
      setSnackbarMessage('You have already submitted your rating for this content.');
      return;
    }

    // Update local state immediately for better UX
    if (userLikeStatus !== 1) {
      setLikes((prev) => prev + 1);
      if (userLikeStatus === -1) {
        setDislikes((prev) => Math.max(0, prev - 1));
      }
      setUserLikeStatus(1);
    } else {
      setLikes((prev) => Math.max(0, prev - 1));
      setUserLikeStatus(0);
    }
  };

  const handleDislike = async () => {
    if (!isLoggedIn) {
      setOpenLoginModal(true);
      return;
    }

    // Don't allow like/dislike changes after rating submission
    if (hasUserRated) {
      setSnackbarMessage('You have already submitted your rating for this content.');
      return;
    }

    // Update local state immediately for better UX
    if (userLikeStatus !== -1) {
      setDislikes((prev) => prev + 1);
      if (userLikeStatus === 1) {
        setLikes((prev) => Math.max(0, prev - 1));
      }
      setUserLikeStatus(-1);
    } else {
      setDislikes((prev) => Math.max(0, prev - 1));
      setUserLikeStatus(0);
    }
  };

  const handleRatingChange = async (event, newValue) => {
    if (!isLoggedIn) {
      setOpenLoginModal(true);
      alert('Please log in again to prevent spam/abuse.');
      return;
    }

    if (hasUserRated) {
      setSnackbarMessage('You have already submitted your rating for this content.');
      return;
    }

    setUserRating(newValue);
  };

  // Updated submitRating function
  const submitRating = async (event) => {
    if (!isLoggedIn) {
      setOpenLoginModal(true);
      setSnackbarMessage('Please log in to submit ratings.');
      return;
    }

    if (hasUserRated) {
      setSnackbarMessage('You have already rated this content.');
      return;
    }

    if (isSubmittingRating) {
      setSnackbarMessage('Rating submission in progress...');
      return;
    }

    // Validation: Check if user has made any rating choice
    if (userRating === 0 && userLikeStatus === 0) {
      setSnackbarMessage('Please provide a star rating or like/dislike before submitting.');
      return;
    }

    try {
      setIsSubmittingRating(true);

      const ratingResponse = await axios.post(
        `${API_URL}/api/unlock/add-rating`,
        {
          contentId: contentData.id,
          rating: userRating,
          likeStatus: userLikeStatus
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      console.log("Rating response:", ratingResponse.data);

      // Mark as rated to prevent future submissions
      setHasUserRated(true);

      // Update the overall content rating if provided
      if (ratingResponse.data.avgRating) {
        setRating(ratingResponse.data.avgRating);
      }

      setSnackbarMessage('Rating submitted successfully!');

    } catch (error) {
      console.error('Error submitting rating:', error);

      if (error.response?.data?.error === 'ALREADY_RATED') {
        setHasUserRated(true);
        setSnackbarMessage('You have already rated this content.');
      } else {
        setSnackbarMessage(error.response?.data?.message || 'Failed to submit rating. Please try again.');
      }
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!isLoggedIn) {
      setSnackbarMessage('Please log in to submit comments.');
      setOpenLoginModal(true);
      return;
    }

    if (!unlocked) {
      setSnackbarMessage('You must unlock this content before commenting.');
      return;
    }

    if (!commentText.trim()) {
      setSnackbarMessage('Please enter a comment before submitting.');
      return;
    }

    try {
      // Create new comment object
      const newComment = {
        id: Date.now(), // Simple ID generation - in production, use UUID or let DB generate
        username: userData.username,
        user_id: userData.user_id,
        avatar: userData.profilePicture,
        comment: commentText.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        likedBy: [], // Array of user IDs who liked this comment
        dislikedBy: [] // Array of user IDs who disliked this comment
      };



      // Update local state
      loadComments(contentData.id) // check for any new comments, that won the race condition
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);

      // Save to database
      await saveCommentsToDb(contentData.id, updatedComments);

      setSnackbarMessage('Comment submitted!');
      setCommentText(''); // Clear the comment field
    } catch (error) {
      console.error('Error submitting comment:', error);
      setSnackbarMessage('Failed to submit comment. Please try again.');
    }
  };

  // Handle comment like/dislike
  const handleCommentLike = async (commentId) => {
    if (!isLoggedIn) {
      setSnackbarMessage('Please log in to interact with comments.');
      setOpenLoginModal(true);
      return;
    }

    if (!unlocked) {
      setSnackbarMessage('You must unlock this content before interacting with comments.');
      return;
    }

    try {
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          const userAlreadyLiked = comment.likedBy?.includes(userData.user_id);
          const userAlreadyDisliked = comment.dislikedBy?.includes(userData.user_id);

          let newLikedBy = comment.likedBy || [];
          let newDislikedBy = comment.dislikedBy || [];
          let newLikes = comment.likes || 0;
          let newDislikes = comment.dislikes || 0;

          if (userAlreadyLiked) {
            // Remove like
            newLikedBy = newLikedBy.filter(id => id !== userData.user_id);
            newLikes = Math.max(0, newLikes - 1);
          } else {
            // Add like
            newLikedBy = [...newLikedBy, userData.user_id];
            newLikes = newLikes + 1;

            // Remove dislike if exists
            if (userAlreadyDisliked) {
              newDislikedBy = newDislikedBy.filter(id => id !== userData.user_id);
              newDislikes = Math.max(0, newDislikes - 1);
            }
          }

          return {
            ...comment,
            likes: newLikes,
            dislikes: newDislikes,
            likedBy: newLikedBy,
            dislikedBy: newDislikedBy
          };
        }
        return comment;
      });

      setComments(updatedComments);
      await saveCommentsToDb(contentData.id, updatedComments);
      setSnackbarMessage('Comment updated!');
    } catch (error) {
      console.error('Error updating comment:', error);
      setSnackbarMessage('Failed to update comment. Please try again.');
    }
  };

  const handleCommentDislike = async (commentId) => {
    if (!isLoggedIn) {
      setSnackbarMessage('Please log in to interact with comments.');
      setOpenLoginModal(true);
      return;
    }

    if (!unlocked) {
      setSnackbarMessage('You must unlock this content before interacting with comments.');
      return;
    }

    try {
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          const userAlreadyLiked = comment.likedBy?.includes(userData.user_id);
          const userAlreadyDisliked = comment.dislikedBy?.includes(userData.user_id);

          let newLikedBy = comment.likedBy || [];
          let newDislikedBy = comment.dislikedBy || [];
          let newLikes = comment.likes || 0;
          let newDislikes = comment.dislikes || 0;

          if (userAlreadyDisliked) {
            // Remove dislike
            newDislikedBy = newDislikedBy.filter(id => id !== userData.user_id);
            newDislikes = Math.max(0, newDislikes - 1);
          } else {
            // Add dislike
            newDislikedBy = [...newDislikedBy, userData.user_id];
            newDislikes = newDislikes + 1;

            // Remove like if exists
            if (userAlreadyLiked) {
              newLikedBy = newLikedBy.filter(id => id !== userData.user_id);
              newLikes = Math.max(0, newLikes - 1);
            }
          }

          return {
            ...comment,
            likes: newLikes,
            dislikes: newDislikes,
            likedBy: newLikedBy,
            dislikedBy: newDislikedBy
          };
        }
        return comment;
      });

      setComments(updatedComments);
      await saveCommentsToDb(contentData.id, updatedComments);
      setSnackbarMessage('Comment updated!');
    } catch (error) {
      console.error('Error updating comment:', error);
      setSnackbarMessage('Failed to update comment. Please try again.');
    }
  };

  // Fetch content data and handle initial logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Get content info
        const contentResponse = await axios.get(`${API_URL}/api/donate/user/${itemid}`);
        const content = contentResponse.data;
        console.log("HostUser Content Data: ", content);
        setContentData(content);

        setLikes(content.likes || 0);
        setDislikes(content.dislikes || 0);
        setViews(content.views || 0);
        setRating(content.rating || 0);

        // Load comments for this content
        await loadComments(content.id);

        // 2) Check if user is logged in
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const balanceResponse = await axios.get(`${API_URL}/api/wallet`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUserBalance(balanceResponse.data.balance);
            setIsLoggedIn(true);
          }
        } catch {
          setIsLoggedIn(false);
        }

        // 3) If logged in, load user profile & user rating
        if (isLoggedIn) {
          await loadUserProfile();
          try {
            const token = localStorage.getItem('token');
            const ratingResp = await axios.get(
              `${API_URL}/api/unlock/content-rating/${content.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserLikeStatus(ratingResp.data.like_status || 0);
            setUserRating(ratingResp.data.rating || 0);
            setHasUserRated(ratingResp.data.has_rated || false);
          } catch (error) {
            console.error('Failed to fetch user rating:', error);
          }
        }

        // 4) Increment view count
        await axios.post(
          `${API_URL}/api/unlock/add-view`,
          { contentId: content.id },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setViews((prev) => prev + 1);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setIsLoggedIn(false);
        } else {
          setError('Failed to load data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Warn user if they leave after unlocking
    const handleBeforeUnload = (e) => {
      if (unlocked) {
        e.preventDefault();
        e.returnValue = 'Go to the unlocked content section in your Stuff Tab';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [itemid, unlocked, isLoggedIn, API_URL]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 2 }}>
      {/* create a component to display a banner ad above the content info section  */}
      {/* <Paper elevation={0} sx={{ p: 2, mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Advertisement
        </Typography>
        <AdObject />
        <img src="https://via.placeholder.com/728x90.png?text=Banner+Ad" alt="Advertisement" />
      </Paper> */}

      {/* Advertisement Section */}
      <Paper elevation={0} sx={{ p: 0, mt: 1, textAlign: 'center', overflow: 'hidden' }}>
        <Typography variant="body2" color="text.secondary" sx={{ p: 0, backgroundColor: '#f5f5f5' }}>
          Advertisement
        </Typography>
        {/* <AdObject
          onAdView={handleAdView}
          onAdClick={handleAdClick}
          onAdSkip={handleAdSkip}
          onRewardClaim={handleRewardClaim}
          RewardModal={SimpleRewardModal}
          showRewardProbability={0.3} // 30% chance to show reward button
          filters={{ format: 'banner' }} // Only show banner ads for this placement
          style={{
            minHeight: '200px', // Ensure minimum height
            borderRadius: 0 // Remove border radius to fit Paper container
          }}
          className="banner-ad"
        /> */}
        <AdAudioObject
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
          filters={{ format: 'banner', mediaFormat: 'audio' }} // Only show banner ads for this placement
          style={{
            minHeight: '75px', // Ensure minimum height
            maxHeight: '150px', // Limit maximum height
            borderRadius: 0 // Remove border radius to fit Paper container
          }}
          className="banner-ad"
        />
      </Paper>
      {/* Gradient Header to match SendMoney */}
      <Divider sx={{ my: 2 }} />
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
          Unlock Content
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Watch an ad OR spend some coins to unlock this link. 
        </Typography>
      </Box>
      {/* <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', marginTop: '20px' }}>
        Unlock Content
      </Typography> */}

      {/* Basic info about the content */}

      <Paper
        elevation={3}
        sx={{
          backgroundColor: '#e3f2fd', // Better light blue shade
          padding: 3,
          borderRadius: 2,
          border: '1px solid #bbdefb'
        }}
      >
        {/* Title Section */}
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: '#1565c0',
            mb: 2
          }}
        >
          {contentData?.title}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Author/Host Section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 1.5,
              fontWeight: 500,
              color: '#1976d2'
            }}
          >
            Created by:
          </Typography>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flex: 1,
              minWidth: 'fit-content'
            }}>
              <Avatar
                src={contentData?.profilePic || contentData?.avatar}
                alt={contentData?.host_username}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid #1976d2'
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: '#1565c0'
                }}
              >
                {contentData?.host_username}
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={() => navigate(`/user/${contentData?.host_username}`)}
              endIcon={<SendOutlined />}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Visit Profile
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Content Details */}
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: '#1565c0',
                mb: 0.5
              }}
            >
              Description:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#424242',
                lineHeight: 1.6
              }}
            >
              {contentData?.description}
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: '#1565c0',
                  mb: 0.5
                }}
              >
                Cost:
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#2e7d32',
                  fontWeight: 600
                }}
              >
                ₡{contentData?.cost}
              </Typography>
            </Box>

            {isLoggedIn && (
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#1565c0',
                    mb: 0.5
                  }}
                >
                  Your Balance:
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#2e7d32',
                    fontWeight: 600
                  }}
                >
                  ₡{userBalance}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Paper>



      {/* Content stats */}
      <Paper style={{ backgroundColor: '#DEEFFF', padding: '10px', marginTop: '20px' }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          {/* Fixed: Vertically aligned icons and numbers */}
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility />
              <Typography variant="body2">{views}</Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LockOpenRounded />
              <Typography variant="body2">{contentData?.unlocks || 0}</Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ThumbUp />
              <Typography variant="body2">{likes}</Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ThumbDownAlt />
              <Typography variant="body2">{dislikes}</Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Star />
              <Typography variant="body2">{rating.toFixed(1)}</Typography>
            </Box>
          </Grid>
          {/* Added: Comments icon */}
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CommentIcon />
              <Typography variant="body2">{comments.length}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Unlock Button or Unlocked Content */}
      {!unlocked ? (
        <>
          <Box sx={{ display: 'flex', variant: "h5", justifyContent: 'center', mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleUnlock}>
              Unlock Content
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h5" gutterBottom align="center">
              Unlocked Content
            </Typography>
            <div style={{ marginBottom: '10px', alignContent: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                Type: {contentData?.type}
              </Typography>
              {renderContent()}
            </div>

            <Paper style={{ backgroundColor: '#DDDDED', padding: '10px', marginTop: '20px' }}>
              <Typography variant="h6" gutterBottom align="center">
                {hasUserRated ? 'Your Rating (Submitted)' : 'Rate This Content'}
              </Typography>
              <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item>
                  <Button
                    variant={userLikeStatus === 1 ? 'contained' : 'outlined'}
                    startIcon={userLikeStatus === 1 ? <ThumbUp /> : <ThumbUpOutlined />}
                    onClick={handleLike}
                    disabled={hasUserRated}
                    color={hasUserRated && userLikeStatus === 1 ? 'success' : 'primary'}
                  >
                    {likes}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant={userLikeStatus === -1 ? 'contained' : 'outlined'}
                    startIcon={userLikeStatus === -1 ? <ThumbDownAlt /> : <ThumbDownAltOutlined />}
                    onClick={handleDislike}
                    disabled={hasUserRated}
                    color={hasUserRated && userLikeStatus === -1 ? 'error' : 'primary'}
                  >
                    {dislikes}
                  </Button>
                </Grid>
                <Grid item>
                  <Typography component="legend">Star Rating:</Typography>
                  <Rating
                    name="content-rating"
                    value={userRating}
                    onChange={handleRatingChange}
                    disabled={hasUserRated}
                  />
                </Grid>
              </Grid>

              {hasUserRated && (
                <Typography
                  variant="body2"
                  color="success.main"
                  align="center"
                  sx={{ mt: 1, fontWeight: 'bold' }}
                >
                  ✓ Thank you for rating this content!
                </Typography>
              )}
            </Paper>

            <div style={{ marginTop: '15px' }}>
              <Typography variant="subtitle1" gutterBottom>
                Leave a message for the Creator:
              </Typography>
              <div style={{ display: "flex", fontSize: '0.8em', color: 'gray', marginBottom: '5px', gap: '5px' }}>
                <TextField
                  label="Leave a Message"
                  fullWidth
                  margin="normal"
                  placeholder={`Enjoy: ₡${contentData?.cost}!`}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={hasUserRated}
                />
                <Button
                  variant={hasUserRated ? 'contained' : 'outlined'}
                  onClick={submitRating}
                  disabled={hasUserRated || isSubmittingRating}
                  color={hasUserRated ? 'success' : 'primary'}
                  sx={{ minWidth: 120 }}
                >
                  {isSubmittingRating ? (
                    <CircularProgress size={20} />
                  ) : hasUserRated ? (
                    'Sent ✓'
                  ) : (
                    'Send Rating'
                  )}
                </Button>
              </div>
              {!hasUserRated && (
                <Typography variant="caption" color="text.secondary">
                  Note: You can only rate content once. Set your star rating and like/dislike before submitting.
                </Typography>
              )}

              {hasUserRated && (
                <Typography variant="caption" color="success.main">
                  Your rating has been submitted successfully!
                </Typography>
              )}
            </div>
          </Paper>
        </>
      )}

      {/* Comments Section */}
      <Paper style={{ backgroundColor: '#F0F0F0', padding: '10px', marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Comments Section
        </Typography>

        {/* Display comments */}
        <Box sx={{ mb: 3 }}>
          {loadingComments ? (
            <CircularProgress size={24} />
          ) : comments.length > 0 ? (
            comments.map((comment) => {
              const userLiked = comment.likedBy?.includes(userData.user_id);
              const userDisliked = comment.dislikedBy?.includes(userData.user_id);

              return (
                <Card key={comment.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar src={comment.avatar} sx={{ width: 24, height: 24 }}>
                        {comment.username.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {comment.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {comment.comment}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleCommentLike(comment.id)}
                          disabled={!isLoggedIn || !unlocked}
                          color={userLiked ? "primary" : "default"}
                        >
                          {userLiked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
                        </IconButton>
                        <Typography variant="caption">{comment.likes || 0}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleCommentDislike(comment.id)}
                          disabled={!isLoggedIn || !unlocked}
                          color={userDisliked ? "primary" : "default"}
                        >
                          {userDisliked ? <ThumbDownAlt fontSize="small" /> : <ThumbDownAltOutlined fontSize="small" />}
                        </IconButton>
                        <Typography variant="caption">{comment.dislikes || 0}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              No comments yet. Be the first to comment!
            </Typography>
          )}
        </Box>
      
      </Paper>

      {/* create a component to display a banner ad beneath the comment section */}
      <Paper elevation={0} sx={{ p: 2, mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Advertisement
        </Typography>
      </Paper>

      {/* Unlock Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Unlock</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to unlock this content for ₡{contentData?.cost}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={confirmUnlock} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Login Modal */}
      <Modal
        open={openLoginModal}
        onClose={() => setOpenLoginModal(false)}
        aria-labelledby="login-modal-title"
        aria-describedby="login-modal-description"
      >
        <Box
          sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', width: 400, height: 600,
            bgcolor: 'background.paper', boxShadow: 24, p: 4, outline: 'none',
          }}
        >
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => setOpenLoginModal(false)}
          >
            <CloseIcon />
          </IconButton>
          <Auth isLogin={true} onLoginSuccess={handleLoginSuccess} />
        </Box>
      </Modal>

      {/* Snackbar for messages */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default Donate;
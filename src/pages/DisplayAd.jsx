import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Box, Snackbar, Alert } from '@mui/material';
import AdObject from '../pages/AdObject'; // Adjust path as needed

const ContentSection = () => {

  const Ad_id = useParams().id || '-1';  // Changed from .username to .user
  
  const [adError, setAdError] = useState(null);
  const [showAdSuccess, setShowAdSuccess] = useState(false);
  const [rewardEarned, setRewardEarned] = useState(0);

  // Handle ad events
  const handleAdView = (ad) => {
    console.log('Ad viewed:', ad);
    // Track ad view analytics or update state
  };

  const handleAdClick = (ad) => {
    console.log('Ad clicked:', ad);
    // Track ad click analytics
  };

  const handleAdSkip = (ad) => {
    console.log('Ad skipped:', ad);
    // Handle ad skip - maybe load another ad or hide the ad section
  };

  const handleRewardClaim = (ad, amount) => {
    console.log('Reward claimed:', { ad, amount });
    setRewardEarned(prev => prev + amount);
    setShowAdSuccess(true);
    // Update user credits in your app state/context
  };

  // Simple Reward Modal Component
  const SimpleRewardModal = ({ ad, onClose, onReward }) => {
    const handleClaimReward = () => {
      const rewardAmount = Math.floor(Math.random() * 10) + 1; // Random 1-10 credits
      onReward(rewardAmount);
      onClose();
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300 // Higher than MUI's modal z-index
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
          <h3 style={{ marginBottom: '16px', color: '#1976d2' }}>
            Congratulations!
          </h3>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            You've earned a reward for engaging with this ad!
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleClaimReward}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                background: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Claim Reward
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: '2px solid #ccc',
                borderRadius: '8px',
                background: 'white',
                color: '#666',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Advertisement Section */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 0, // Remove padding to let AdObject handle its own spacing
          mt: 2, 
          overflow: 'hidden', // Prevent content overflow
          borderRadius: 2
        }}
      >
        <Box sx={{ p: 1, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
            Advertisement
          </Typography>
        </Box>
        
        {/* AdObject Component */}
        <AdObject
          onAdView={handleAdView}
          onAdClick={handleAdClick}
          onAdSkip={handleAdSkip}
          onRewardClaim={handleRewardClaim}
          RewardModal={SimpleRewardModal}
          showRewardProbability={0.3} // 30% chance to show reward button
          filters={{ format: 'video' }} // Only show banner ads for this placement
          style={{
            minHeight: '200px', // Ensure minimum height
            borderRadius: 0 // Remove border radius to fit Paper container
          }}
          getAdById={Ad_id}
          className="banner-ad"
        />
      </Paper>

      {/* Success notification for rewards */}
      <Snackbar
        open={showAdSuccess}
        autoHideDuration={3000}
        onClose={() => setShowAdSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowAdSuccess(false)} severity="success">
          Reward earned! You gained some credits.
        </Alert>
      </Snackbar>

      {/* Error notification */}
      {adError && (
        <Snackbar
          open={!!adError}
          autoHideDuration={5000}
          onClose={() => setAdError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setAdError(null)} severity="error">
            {adError}
          </Alert>
        </Snackbar>
      )}

      {/* Your main content goes here */}
      <Paper elevation={0} sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6">Your Content</Typography>
        <Typography variant="body1">
          Your main content goes here...
        </Typography>
      </Paper>
    </div>
  );
};

export default ContentSection;
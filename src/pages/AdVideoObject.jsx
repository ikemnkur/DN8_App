import React, { useState, useEffect } from 'react';
import {
  fetchDisplayAds,
  trackAdView,
  trackAdSkip,
  trackAdCompletion,
  trackRewardClaim,
  fetchRandomQuizQuestion,
  submitQuizAnswer,
} from '../components/api';

import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Snackbar,
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';

const LiveAdvertisement = ({
  onAdView,
  onAdClick,
  onAdSkip,
  onRewardClaim,
  RewardModal,
  showRewardProbability = 0.2,
  style = {},
  className = '',
  filters = {}, // For filtering ads by format, etc.
  getAdById = -1 // If provided, fetch and display this specific ad
}) => {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showRewardButton, setShowRewardButton] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [quizResult, setQuizResult] = useState(null);
  const [adViewed, setAdViewed] = useState(false);

  // if user is not logged dont show reward button
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setShowRewardButton(false);
    } else {
      setShowRewardButton(Math.random() < showRewardProbability);
    }
  }, [showRewardProbability]);

  // Fetch advertisement data
  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true);
        setError(null);

        const userdata = JSON.parse(localStorage.getItem('userdata')) || {};
        console.log('Fetching ads with filters:', filters,"and media format:", filters.mediaFormat, ' for User:', localStorage.getItem('token') ? userdata.username || 'Guest' : 'Guest');

        const response = await fetchDisplayAds(filters.format, filters.mediaFormat, userdata.user_id || 0, getAdById !== -1 ? getAdById : null);

        // console.log('Fetched Ads:', response.ads[0]);

        if (!response.ads || response.ads.length === 0) {
          setAd(null);
          return;
        }

        console.log("List of ads fetched:", response.ads);

        const adData = response.ads[0]; // Get first ad
        setAd(adData);

        console.log('Current Ad Data Media link:', adData.media_url);

        // Determine if reward button should be shown
        setShowRewardButton(Math.random() < showRewardProbability);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching advertisement:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [filters, showRewardProbability]);

  const goToAdWebSite = (ad) => {
    if (ad?.link) {
      window.open(ad.link, '_blank');
    }
  };


  // Track ad view when component mounts and ad is loaded
  useEffect(() => {
    if (ad && !adViewed) {
      handleAdView();
    }
  }, [ad, adViewed]);

  const handleAdView = async () => {
    if (!ad || adViewed) return;
    let guest = true;
    try {
      // check if user is logged or a guest
      if (localStorage.getItem('token')) {
        guest = false;
      }
      await trackAdView(ad.id, guest);

      setAdViewed(true);

      if (onAdView) {
        onAdView(ad);
      }
    } catch (error) {
      console.error('Error tracking ad view:', error);
    }
  };

  const handleFindOutMore = async () => {
    if (!ad?.findOutMoreLink) return;
    let guest = true;
    try {
      // check if user is logged or a guest
      if (localStorage.getItem('token')) {
        guest = false;
      }
      // Track completion since user is engaging with the ad
      await trackAdCompletion(ad.id, guest);

      if (onAdClick) {
        onAdClick(ad);
      }

      // Open link in new tab
      window.open(ad.findOutMoreLink, '_blank');
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const handleRewardClick = async () => {
    if (!ad) return;
    console.log("Ad ID: ", ad)
    let guest = true;
    try {
      // check if user is logged or a guest
      if (localStorage.getItem('token')) {
        guest = false;
      }
      // Fetch quiz question for this ad
      const quizResponse = await fetchRandomQuizQuestion(ad.id);
      setQuizQuestion(quizResponse.question);
      setShowQuiz(true);
    } catch (error) {
      console.error('Error fetching quiz question:', error);
      // If no quiz available, show reward modal directly
      setShowRewardModal(true);
    }
  };

  const handleQuizSubmit = async () => {
    if (!quizQuestion || !ad) return;

    try {
      const response = await submitQuizAnswer(
        ad.id,
        quizQuestion.id,
        quizAnswer,
        selectedOption
      );

      setQuizResult(response);

      if (response.correct) {
        // Close quiz and show reward modal after short delay
        setTimeout(() => {
          setShowQuiz(false);
          setShowRewardModal(true);
        }, 1500);
      } else {
        // Close quiz after showing incorrect message
        setTimeout(() => {
          setShowQuiz(false);
          setQuizResult(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting quiz answer:', error);
    }
  };

  const handleRewardEarned = async (amount) => {
    let guest = true;
    try {
      // check if user is logged or a guest
      if (localStorage.getItem('token')) {
        guest = false;
      }
      await trackRewardClaim(ad.id, amount);

      if (onRewardClaim) {
        onRewardClaim(ad, amount);
      }

      setShowRewardModal(false);
    } catch (error) {
      console.error('Error tracking reward claim:', error);
    }
  };

  // const handleSkip = async () => {
  //   if (!ad) return;

  //   try {
  //     await trackAdSkip(ad.id);

  //     if (onAdSkip) {
  //       onAdSkip(ad);
  //     }

  //     setAd(null);
  //   } catch (error) {
  //     console.error('Error tracking ad skip:', error);
  //   }
  // };

  const handleClose = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'CLOSE_AD' }, '*');
    } else {
      window.close();
    }
  };

  const resetQuiz = () => {
    setQuizAnswer('');
    setSelectedOption('');
    setQuizResult(null);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '24px',
        ...style
      }} className={className}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            ⏳
          </div>
          <p style={{ fontSize: '18px', fontWeight: 600 }}>Loading advertisement...</p>
        </div>
      </div>
    );
  }

  // Error or no ad state
  if (error || !ad) {
    return (
      <div style={{
        minHeight: '400px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '24px',
        ...style
      }} className={className}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>
            {error ? '❌' : '🎉'}
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'rgba(0, 0, 0, 0.8)',
            marginBottom: '16px'
          }}>
            {error ? 'Error Loading Ad' : 'No Ads Available'}
          </h2>
          <p style={{
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: '16px',
            lineHeight: 1.6,
            marginBottom: '24px'
          }}>
            {error
              ? 'There was an error loading the advertisement. Please try again later.'
              : "Great! No ads to display at the moment. Enjoy the ad-free experience!"}
          </p>
          <button
            onClick={handleClose}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Quiz Modal
  if (showQuiz && quizQuestion) {
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
        zIndex: 1000,
        ...style
      }} className={className}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '24px',
            color: 'rgba(0, 0, 0, 0.85)'
          }}>
            Answer to Earn Reward! 🎁
          </h3>

          <p style={{
            fontSize: '16px',
            marginBottom: '24px',
            color: 'rgba(0, 0, 0, 0.7)',
            lineHeight: 1.6
          }}>
            {quizQuestion.question}
          </p>

          {quizQuestion.type === 'multiple' && quizQuestion.options ? (
            <div style={{ marginBottom: '24px' }}>
              {quizQuestion.options.map((option, index) => (
                <label key={index} style={{
                  display: 'block',
                  margin: '8px 0',
                  padding: '12px',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  backgroundColor: selectedOption === option ? 'rgba(59, 130, 246, 0.1)' : 'white',
                  borderColor: selectedOption === option ? 'rgba(59, 130, 246, 0.5)' : 'rgba(0, 0, 0, 0.1)'
                }}>
                  <input
                    type="radio"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  {option}
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={quizAnswer}
              onChange={(e) => setQuizAnswer(e.target.value)}
              placeholder="Enter your answer..."
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                fontSize: '16px',
                marginBottom: '24px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)'}
            />
          )}

          {quizResult && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: quizResult.correct ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: quizResult.correct ? 'rgba(22, 163, 74, 1)' : 'rgba(220, 38, 38, 1)',
              fontWeight: 600
            }}>
              {quizResult.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleQuizSubmit}
              disabled={!quizAnswer && !selectedOption}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                color: 'white',
                background: (!quizAnswer && !selectedOption)
                  ? 'rgba(0, 0, 0, 0.3)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                cursor: (!quizAnswer && !selectedOption) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Submit Answer
            </button>

            <button
              onClick={() => {
                setShowQuiz(false);
                resetQuiz();
              }}
              style={{
                padding: '12px 24px',
                border: '2px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                color: 'rgba(0, 0, 0, 0.7)',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  // Main ad display (compact, max 25% of screen)
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
        borderRadius: '12px',
        padding: '5px',
        position: 'relative',
        maxWidth: '100%',
        minWidth: '260px',
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        // ...style
      }}
      className={className}
    >
      <Box sx={{ p: 0.5, textAlign: 'center', backgroundColor: '#f5f5f5' , borderRadius: '12px 12px 0 0' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
          Advertisement
        </Typography>
      </Box>

      {/* Ad Content */}
      <div
        style={{
          background: 'white',
          display: 'flex',
          borderRadius: '0 0 12px 12px',
          padding: '3px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
          maxWidth: '100%',
          textAlign: 'center',
          position: 'relative',
        }}
      >

        {/* Ad Media (if applicable) */}
        {ad.media_url && (
          <div style={{ marginBottom: '4px' }}>
            {/* {ad.format === 'video' && ( */}
            <video
              autoPlay
              loop
              playsInline
              alt={ad.title}
              style={{ maxHeight: '200px', borderRadius: '8px', padding: '4px', width: '100%', objectFit: 'cover' }}
              src={ad.media_url}
            />
            {/* )} */}

          </div>
        )}
        <div
          style={{ padding: '0 10px 4px 10px', margin: 'auto auto', alignItems: 'center', display: 'flex', flexDirection: 'column' }}
        >
          {/* Ad Title */}
          <h6
            style={{
              fontSize: '0.98rem',
              fontWeight: 'bold',
              color: 'rgba(0,0,0,0.85)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '2px',
            }}
          >
            {ad.title}
          </h6>

          {/* Ad Description */}
          <p
            style={{
              color: 'rgba(0,0,0,0.65)',
              marginBottom: '6px',
              lineHeight: 1.2,
              fontSize: '0.92rem',
              maxHeight: '2.8em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {ad.description}
          </p>



          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',

              gap: '8px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '4px',
            }}
          >
            {/* Find Out More Button */}
            {ad.findOutMoreLink && (
              <button
                onClick={handleFindOutMore}
                style={{
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59,130,246,0.28)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(59,130,246,0.18)';
                }}
              >
                <span>🔗</span> More
              </button>
            )}

            {/* Conditional Reward Button */}
            {showRewardButton && (
              <button
                onClick={handleRewardClick}
                style={{
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  animation: 'pulse 2s infinite',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px) scale(1.04)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.28)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 2px 8px rgba(16,185,129,0.18)';
                }}
              >
                <span>🎁</span> Reward
              </button>
            )}

            {/* Skip Button */}
            {/* <button
              onClick={handleSkip}
              style={{
                padding: '8px 14px',
                border: '1px solid rgba(0,0,0,0.14)',
                borderRadius: '8px',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'rgba(0,0,0,0.7)',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0,0,0,0.04)';
                e.target.style.borderColor = 'rgba(0,0,0,0.22)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = 'rgba(0,0,0,0.14)';
              }}
            >
              Skip
            </button> */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent the ad click from triggering
                goToAdWebSite(ad);
              }}
              style={{
                padding: '12px 12px',
                border: '2px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(0, 0, 0, 0.7)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                onHover: { backgroundColor: 'rgba(156, 255, 138, 0.36)' }
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
               <span>🔗</span> Learn More
            </button>
          </div>

          {/* Sponsored Badge */}
          {/* <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.04)',
            color: 'rgba(0,0,0,0.5)',
            padding: '3px 8px',
            borderRadius: '10px',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Sponsored
        </div> */}
        </div>

      </div>

      {/* Reward Modal */}
      {showRewardModal && RewardModal && (
        <RewardModal
          ad={ad}
          onClose={() => setShowRewardModal(false)}
          onReward={handleRewardEarned}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default LiveAdvertisement;
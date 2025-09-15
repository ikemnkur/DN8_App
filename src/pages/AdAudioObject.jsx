import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
} from 'react';
import {
  fetchDisplayAds,
  trackAdView,
  trackAdCompletion,
  trackRewardClaim,
  fetchRandomQuizQuestion,
  submitQuizAnswer,
} from '../components/api';
import { Modal } from '@mui/material';

const stableStringify = (obj) => {
  if (!obj || typeof obj !== 'object') return String(obj);
  const keys = [];
  JSON.stringify(obj, (k, v) => (keys.push(k), v));
  keys.sort();
  return JSON.stringify(obj, keys);
};

const areEqual = (prev, next) => {
  const sameFilters =
    stableStringify(prev.filters || {}) === stableStringify(next.filters || {});
  const sameStyle =
    stableStringify(prev.style || {}) === stableStringify(next.style || {});
  return (
    prev.getAdById === next.getAdById &&
    prev.showRewardProbability === next.showRewardProbability &&
    prev.className === next.className &&
    sameFilters &&
    sameStyle
  );
};

const AdAudioObject = memo(function AdAudioObject({
  onAdView,
  onAdClick, // kept for parity, though not used here
  onRewardClaim,
  RewardModal,
  showRewardProbability = 0.2,
  style = {},
  className = '',
  filters = {},
  getAdById = -1,
}) {
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
  const [showAdDetails, setShowAdDetails] = useState(false);

  // refs to avoid re-renders
  const audioRef = useRef(null);
  const playGuard = useRef(false);

  const filtersKey = useMemo(() => stableStringify(filters), [filters]);
  const styleKey = useMemo(() => stableStringify(style), [style]);
  const hasToken = useMemo(() => Boolean(localStorage.getItem('token')), []);

  useEffect(() => {
    setShowRewardButton(hasToken && Math.random() < showRewardProbability);
  }, [hasToken, showRewardProbability]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const userdata = JSON.parse(localStorage.getItem('userdata') || '{}');
        const res = await fetchDisplayAds(
          filters.format,
          filters.mediaFormat,
          userdata.user_id || 0,
          getAdById !== -1 ? getAdById : null
        );
        if (!res.ads || res.ads.length === 0) {
          if (!cancelled) setAd(null);
        } else {
          if (!cancelled) {
            setAd(res.ads[0]);
            setAdViewed(false);
            setShowRewardButton(hasToken && Math.random() < showRewardProbability);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load ad');
          setAd(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filtersKey, getAdById, hasToken, showRewardProbability, filters.format, filters.mediaFormat]);

  // view once + delayed autoplay (once)
  const viewGuard = useRef(null);
  useEffect(() => {
    if (!ad || adViewed) return;
    if (viewGuard.current === ad.id) return;
    viewGuard.current = ad.id;

    (async () => {
      try {
        await trackAdView(ad.id, !hasToken);
        setAdViewed(true);
        onAdView && onAdView(ad);
      } catch { }
    })();

    if (!playGuard.current) {
      playGuard.current = true;
      setTimeout(() => {
        // Try autoplay; browsers may block without interaction.
        audioRef.current?.play().catch(() => { });
      }, 5000);
    }
  }, [ad, adViewed, hasToken, onAdView]);

  const goToAdWebSite = useCallback((theAd) => {
    if (theAd?.link) window.open(theAd.link, '_blank');
  }, []);

  const handleRewardClick = useCallback(async () => {
    if (!ad) return;
    try {
      const quiz = await fetchRandomQuizQuestion(ad.id);
      setQuizQuestion(quiz.question);
      setShowQuiz(true);
    } catch {
      setShowRewardModal(true);
    }
  }, [ad]);

  const handleQuizSubmit = useCallback(async () => {
    if (!quizQuestion || !ad) return;
    try {
      const res = await submitQuizAnswer(
        ad.id,
        quizQuestion.id,
        quizAnswer,
        selectedOption
      );
      setQuizResult(res);
      if (res.correct) {
        setTimeout(() => {
          setShowQuiz(false);
          setShowRewardModal(true);
        }, 1500);
      } else {
        setTimeout(() => {
          setShowQuiz(false);
          setQuizResult(null);
        }, 2000);
      }
    } catch { }
  }, [ad, quizQuestion, quizAnswer, selectedOption]);

  const handleRewardEarned = useCallback(
    async (amount) => {
      if (!ad) return;
      try {
        await trackRewardClaim(ad.id, amount);
        onRewardClaim && onRewardClaim(ad, amount);
        setShowRewardModal(false);
      } catch { }
    },
    [ad, onRewardClaim]
  );

  const handleClose = useCallback(() => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'CLOSE_AD' }, '*');
    } else {
      window.close();
    }
  }, []);

  const resetQuiz = useCallback(() => {
    setQuizAnswer('');
    setSelectedOption('');
    setQuizResult(null);
  }, []);

  // UI trimmed (loading/error returns null to keep this concise)
  if (loading || error || !ad) return null;

  return (
    <div className={className} style={{ ...style }} data-style-key={styleKey}>
      <div
        style={{
          background: 'white',
          display: 'flex',
          padding: 3,
          maxWidth: '100%',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {ad.media_url && (
          <div style={{ marginBottom: 4, minWidth: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 10 }}>
            <span role="img" aria-label="speaker" style={{ fontSize: 96, margin: 'auto' }}>
              🔊
            </span>
            <audio
              ref={audioRef}
              id={`ad-audio-${ad.id}`}
              key={ad.id}
              src={ad.media_url}
              style={{ display: 'none' }}
            />
          </div>
        )}

        <div style={{ padding: '5px 5px', margin: 'auto', minWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* add info icon at top right corner */}
          <div style={{ position: 'absolute', top: -8, right: -5 }}>
            {/* when clicked should a modal with advertiser details */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowAdDetails(true);
              }}
              style={{
                cursor: 'pointer',
                padding: 4,
                borderRadius: '50%',
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span role="img" aria-label="info" style={{ fontSize: 24 }}>
                ℹ️
              </span>
            </div>


          </div>
          <strong
            style={{
              fontSize: '0.98rem',
              fontWeight: 'bold',
              color: 'rgba(0,0,0,0.85)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: 2,
            }}
          >
            {ad.title}
          </strong>

          <p
            style={{
              color: 'rgba(0,0,0,0.65)',
              marginBottom: 6,
              lineHeight: 1.2,
              fontSize: '0.7rem',
              maxHeight: '2.8em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {ad.description}
          </p>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            {ad.findOutMoreLink && (
              <button
                onClick={() => goToAdWebSite(ad)}
                style={{
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>🔗</span> More
              </button>
            )}

            {showRewardButton && (
              <button
                onClick={handleRewardClick}
                style={{
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  animation: 'pulse 2s infinite',
                }}
              >
                <span>🎁</span> Reward
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
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
        </div>
      </div>



      {showQuiz && quizQuestion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              maxWidth: 500,
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 24, color: 'rgba(0,0,0,0.85)' }}>
              Answer to Earn Reward! 🎁
            </h3>

            <p style={{ fontSize: 16, marginBottom: 24, color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
              {quizQuestion.question}
            </p>

            {quizQuestion.type === 'multiple' && quizQuestion.options ? (
              <div style={{ marginBottom: 24 }}>
                {quizQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    style={{
                      display: 'block',
                      margin: '8px 0',
                      padding: 12,
                      border: '2px solid rgba(0,0,0,0.1)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s ease',
                      backgroundColor: selectedOption === option ? 'rgba(59,130,246,0.1)' : 'white',
                      borderColor: selectedOption === option ? 'rgba(59,130,246,0.5)' : 'rgba(0,0,0,0.1)',
                    }}
                  >
                    <input
                      type="radio"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      style={{ marginRight: 8 }}
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
                  padding: 12,
                  border: '2px solid rgba(0,0,0,0.1)',
                  borderRadius: 8,
                  fontSize: 16,
                  marginBottom: 24,
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                }}
              />
            )}

            {quizResult && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  background: quizResult.correct ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: quizResult.correct ? 'rgba(22,163,74,1)' : 'rgba(220,38,38,1)',
                  fontWeight: 600,
                }}
              >
                {quizResult.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={handleQuizSubmit}
                disabled={!quizAnswer && !selectedOption}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'white',
                  background:
                    !quizAnswer && !selectedOption
                      ? 'rgba(0,0,0,0.3)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  cursor: !quizAnswer && !selectedOption ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
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
                  border: '2px solid rgba(0,0,0,0.2)',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'rgba(0,0,0,0.7)',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Modal
        open={showAdDetails}
        onClose={() => setShowAdDetails(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🏢</span>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                Advertiser Information
              </h2>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowAdDetails(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '32px' }}>
            {ad.advertiser ? (
              <div>
                {/* Business Info Card */}
                <div style={{
                  background: 'rgba(102, 126, 234, 0.05)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '2px solid rgba(102, 126, 234, 0.1)',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.8)',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>🏪</span>
                    Business Details
                  </h3>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: 'rgba(0, 0, 0, 0.7)' }}>Name:</span>
                      <span style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                        {ad.advertiser.Business_Name || 'N/A'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: 'rgba(0, 0, 0, 0.7)' }}>Email:</span>
                      <span style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                        {ad.advertiser.email || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Info Card */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.05)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '2px solid rgba(16, 185, 129, 0.1)',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.8)',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📍</span>
                    Location
                  </h3>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: 'rgba(0, 0, 0, 0.7)' }}>Country:</span>
                      <span style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                        {ad.advertiser.country || 'N/A'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: 'rgba(0, 0, 0, 0.7)' }}>State:</span>
                      <span style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                        {ad.advertiser.state || 'N/A'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: 'rgba(0, 0, 0, 0.7)' }}>City:</span>
                      <span style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                        {ad.advertiser.city || 'N/A'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: 'rgba(0, 0, 0, 0.7)' }}>ZIP:</span>
                      <span style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                        {ad.advertiser.zip || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Website Link */}
                {ad.advertiser.website && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.05)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '2px solid rgba(245, 158, 11, 0.1)',
                    textAlign: 'center'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: 'rgba(0, 0, 0, 0.8)',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <span>🌐</span>
                      Visit Our Website
                    </h3>

                    <a
                      href={ad.advertiser.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                      }}
                    >
                      <span>🔗</span>
                      Visit Website
                    </a>

                    <p style={{
                      margin: '12px 0 0 0',
                      fontSize: '12px',
                      color: 'rgba(0, 0, 0, 0.5)'
                    }}>
                      {ad.advertiser.website}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'rgba(0, 0, 0, 0.6)'
              }}>
                <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>📭</span>
                <p style={{ fontSize: '16px', margin: 0 }}>
                  No advertiser information available
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {showRewardModal && RewardModal && (
        <RewardModal ad={ad} onClose={() => setShowRewardModal(false)} onReward={handleRewardEarned} />
      )}
    </div>
  );
}, areEqual);

export default AdAudioObject;

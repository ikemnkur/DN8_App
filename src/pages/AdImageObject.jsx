// import React, {
//   useState,
//   useEffect,
//   useMemo,
//   useCallback,
//   useRef,
//   memo,
// } from 'react';
// import {
//   fetchDisplayAds,
//   trackAdView,
//   trackAdCompletion,
//   trackRewardClaim,
//   fetchRandomQuizQuestion,
//   submitQuizAnswer,
// } from '../components/api';
// import { Typography, Box } from '@mui/material';

// const stableStringify = (obj) => {
//   if (!obj || typeof obj !== 'object') return String(obj);
//   const keys = [];
//   JSON.stringify(obj, (k, v) => (keys.push(k), v));
//   keys.sort();
//   return JSON.stringify(obj, keys);
// };

// const areEqual = (prev, next) => {
//   const sameFilters =
//     stableStringify(prev.filters || {}) === stableStringify(next.filters || {});
//   const sameStyle =
//     stableStringify(prev.style || {}) === stableStringify(next.style || {});
//   return (
//     prev.getAdById === next.getAdById &&
//     prev.showRewardProbability === next.showRewardProbability &&
//     prev.className === next.className &&
//     sameFilters &&
//     sameStyle
//   );
// };

// const AdImageObject = memo(function AdImageObject({
//   onAdView,
//   onAdClick,
//   onRewardClaim,
//   RewardModal,
//   showRewardProbability = 0.2,
//   style = {},
//   className = '',
//   filters = {},
//   getAdById = -1,
// }) {
//   const [ad, setAd] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showRewardModal, setShowRewardModal] = useState(false);
//   const [showRewardButton, setShowRewardButton] = useState(false);
//   const [quizQuestion, setQuizQuestion] = useState(null);
//   const [showQuiz, setShowQuiz] = useState(false);
//   const [quizAnswer, setQuizAnswer] = useState('');
//   const [selectedOption, setSelectedOption] = useState('');
//   const [quizResult, setQuizResult] = useState(null);
//   const [adViewed, setAdViewed] = useState(false);

//   // stable keys
//   const filtersKey = useMemo(() => stableStringify(filters), [filters]);
//   const styleKey = useMemo(() => stableStringify(style), [style]);
//   const hasToken = useMemo(() => Boolean(localStorage.getItem('token')), []);

//   useEffect(() => {
//     setShowRewardButton(hasToken && Math.random() < showRewardProbability);
//   }, [hasToken, showRewardProbability]);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const userdata = JSON.parse(localStorage.getItem('userdata') || '{}');
//         const res = await fetchDisplayAds(
//           filters.format,
//           filters.mediaFormat,
//           userdata.user_id || 0,
//           getAdById !== -1 ? getAdById : null
//         );
//         if (!res.ads || res.ads.length === 0) {
//           if (!cancelled) setAd(null);
//         } else {
//           if (!cancelled) {
//             setAd(res.ads[0]);
//             setAdViewed(false);
//             setShowRewardButton(hasToken && Math.random() < showRewardProbability);
//           }
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setError(e?.message || 'Failed to load ad');
//           setAd(null);
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [filtersKey, getAdById, hasToken, showRewardProbability, filters.format, filters.mediaFormat]);

//   // view once per ad
//   const viewGuard = useRef(null);
//   useEffect(() => {
//     if (!ad || adViewed) return;
//     if (viewGuard.current === ad.id) return;
//     viewGuard.current = ad.id;
//     (async () => {
//       try {
//         await trackAdView(ad.id, !hasToken);
//         setAdViewed(true);
//         onAdView && onAdView(ad);
//       } catch {}
//     })();
//   }, [ad, adViewed, hasToken, onAdView]);

//   const goToAdWebSite = useCallback((theAd) => {
//     if (theAd?.link) window.open(theAd.link, '_blank');
//   }, []);

//   const handleFindOutMore = useCallback(async () => {
//     if (!ad?.findOutMoreLink) return;
//     try {
//       await trackAdCompletion(ad.id, !hasToken);
//       onAdClick && onAdClick(ad);
//       window.open(ad.findOutMoreLink, '_blank');
//     } catch {}
//   }, [ad, hasToken, onAdClick]);

//   const handleRewardClick = useCallback(async () => {
//     if (!ad) return;
//     try {
//       const quiz = await fetchRandomQuizQuestion(ad.id);
//       setQuizQuestion(quiz.question);
//       setShowQuiz(true);
//     } catch {
//       setShowRewardModal(true);
//     }
//   }, [ad]);

//   const handleQuizSubmit = useCallback(async () => {
//     if (!quizQuestion || !ad) return;
//     try {
//       const res = await submitQuizAnswer(
//         ad.id,
//         quizQuestion.id,
//         quizAnswer,
//         selectedOption
//       );
//       setQuizResult(res);
//       if (res.correct) {
//         setTimeout(() => {
//           setShowQuiz(false);
//           setShowRewardModal(true);
//         }, 1500);
//       } else {
//         setTimeout(() => {
//           setShowQuiz(false);
//           setQuizResult(null);
//         }, 2000);
//       }
//     } catch {}
//   }, [ad, quizQuestion, quizAnswer, selectedOption]);

//   const handleRewardEarned = useCallback(
//     async (amount) => {
//       if (!ad) return;
//       try {
//         await trackRewardClaim(ad.id, amount);
//         onRewardClaim && onRewardClaim(ad, amount);
//         setShowRewardModal(false);
//       } catch {}
//     },
//     [ad, onRewardClaim]
//   );

//   const handleClose = useCallback(() => {
//     if (window.parent !== window) {
//       window.parent.postMessage({ type: 'CLOSE_AD' }, '*');
//     } else {
//       window.close();
//     }
//   }, []);

//   const resetQuiz = useCallback(() => {
//     setQuizAnswer('');
//     setSelectedOption('');
//     setQuizResult(null);
//   }, []);

//   // UI
//   if (loading) {
//     return (
//       <div
//         style={{
//           minHeight: '400px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           borderRadius: '24px',
//           ...style,
//         }}
//         className={className}
//       >
//         <div style={{ textAlign: 'center', color: 'white' }}>
//           <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
//           <p style={{ fontSize: 18, fontWeight: 600 }}>Loading advertisement...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !ad) {
//     return (
//       <div
//         style={{
//           minHeight: '400px',
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           padding: 24,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           borderRadius: '24px',
//           ...style,
//         }}
//         className={className}
//       >
//         <div
//           style={{
//             background: 'rgba(255,255,255,0.95)',
//             backdropFilter: 'blur(20px)',
//             borderRadius: 24,
//             boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
//             padding: 48,
//             textAlign: 'center',
//             maxWidth: 500,
//             width: '100%',
//           }}
//         >
//           <div style={{ fontSize: 64, marginBottom: 24 }}>{error ? '❌' : '🎉'}</div>
//           <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.8)', marginBottom: 16 }}>
//             {error ? 'Error Loading Ad' : 'No Ads Available'}
//           </h2>
//           <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
//             {error
//               ? 'There was an error loading the advertisement. Please try again later.'
//               : 'Great! No ads to display at the moment. Enjoy the ad-free experience!'}
//           </p>
//           <button
//             onClick={handleClose}
//             style={{
//               padding: '12px 24px',
//               border: 'none',
//               borderRadius: 12,
//               fontSize: 16,
//               fontWeight: 600,
//               color: 'white',
//               background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
//               cursor: 'pointer',
//               transition: 'all 0.3s ease',
//               boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
//             }}
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (showQuiz && quizQuestion) {
//     return (
//       <div
//         style={{
//           position: 'fixed',
//           inset: 0,
//           background: 'rgba(0,0,0,0.8)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           zIndex: 1000,
//           ...style,
//         }}
//         className={className}
//         data-style-key={styleKey}
//       >
//         <div
//           style={{
//             background: 'white',
//             borderRadius: 16,
//             padding: 32,
//             maxWidth: 500,
//             width: '90%',
//             textAlign: 'center',
//             boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
//           }}
//         >
//           <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 24, color: 'rgba(0,0,0,0.85)' }}>
//             Answer to Earn Reward! 🎁
//           </h3>

//           <p style={{ fontSize: 16, marginBottom: 24, color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
//             {quizQuestion.question}
//           </p>

//           {quizQuestion.type === 'multiple' && quizQuestion.options ? (
//             <div style={{ marginBottom: 24 }}>
//               {quizQuestion.options.map((option, idx) => (
//                 <label
//                   key={idx}
//                   style={{
//                     display: 'block',
//                     margin: '8px 0',
//                     padding: 12,
//                     border: '2px solid rgba(0,0,0,0.1)',
//                     borderRadius: 8,
//                     cursor: 'pointer',
//                     textAlign: 'left',
//                     transition: 'all 0.3s ease',
//                     backgroundColor: selectedOption === option ? 'rgba(59,130,246,0.1)' : 'white',
//                     borderColor: selectedOption === option ? 'rgba(59,130,246,0.5)' : 'rgba(0,0,0,0.1)',
//                   }}
//                 >
//                   <input
//                     type="radio"
//                     value={option}
//                     checked={selectedOption === option}
//                     onChange={(e) => setSelectedOption(e.target.value)}
//                     style={{ marginRight: 8 }}
//                   />
//                   {option}
//                 </label>
//               ))}
//             </div>
//           ) : (
//             <input
//               type="text"
//               value={quizAnswer}
//               onChange={(e) => setQuizAnswer(e.target.value)}
//               placeholder="Enter your answer..."
//               style={{
//                 width: '100%',
//                 padding: 12,
//                 border: '2px solid rgba(0,0,0,0.1)',
//                 borderRadius: 8,
//                 fontSize: 16,
//                 marginBottom: 24,
//                 outline: 'none',
//                 transition: 'border-color 0.3s ease',
//               }}
//             />
//           )}

//           {quizResult && (
//             <div
//               style={{
//                 padding: 12,
//                 borderRadius: 8,
//                 marginBottom: 16,
//                 background: quizResult.correct ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
//                 color: quizResult.correct ? 'rgba(22,163,74,1)' : 'rgba(220,38,38,1)',
//                 fontWeight: 600,
//               }}
//             >
//               {quizResult.message}
//             </div>
//           )}

//           <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
//             <button
//               onClick={handleQuizSubmit}
//               disabled={!quizAnswer && !selectedOption}
//               style={{
//                 padding: '12px 24px',
//                 border: 'none',
//                 borderRadius: 8,
//                 fontSize: 16,
//                 fontWeight: 600,
//                 color: 'white',
//                 background:
//                   !quizAnswer && !selectedOption
//                     ? 'rgba(0,0,0,0.3)'
//                     : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
//                 cursor: !quizAnswer && !selectedOption ? 'not-allowed' : 'pointer',
//                 transition: 'all 0.3s ease',
//               }}
//             >
//               Submit Answer
//             </button>

//             <button
//               onClick={() => {
//                 setShowQuiz(false);
//                 resetQuiz();
//               }}
//               style={{
//                 padding: '12px 24px',
//                 border: '2px solid rgba(0,0,0,0.2)',
//                 borderRadius: 8,
//                 fontSize: 16,
//                 fontWeight: 600,
//                 color: 'rgba(0,0,0,0.7)',
//                 backgroundColor: 'white',
//                 cursor: 'pointer',
//                 transition: 'all 0.3s ease',
//               }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       style={{
//         background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)',
//         borderRadius: 12,
//         padding: 5,
//         position: 'relative',
//         maxWidth: '100%',
//         minWidth: 260,
//         width: '100%',
//         boxSizing: 'border-box',
//         margin: '0 auto',
//         ...style,
//       }}
//       className={className}
//       data-style-key={styleKey}
//     >
//       <Box sx={{ p: 0.5, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '12px 12px 0 0' }}>
//         <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
//           Advertisement
//         </Typography>
//       </Box>

//       <div
//         style={{
//           background: 'white',
//           display: 'flex',
//           borderRadius: '0 0 12px 12px',
//           padding: 3,
//           boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
//           border: '1px solid rgba(0,0,0,0.04)',
//           maxWidth: '100%',
//           textAlign: 'center',
//           position: 'relative',
//         }}
//       >
//         {ad.media_url && (
//           <div style={{ marginBottom: 4 }}>
//             <img
//               src={ad.media_url}
//               alt={ad.title}
//               style={{ maxHeight: 180, objectFit: 'cover', borderRadius: 8 }}
//             />
//           </div>
//         )}

//         <div style={{ padding: '0 10px 4px 10px', margin: 'auto', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
//           <strong
//             style={{
//               fontSize: '0.98rem',
//               fontWeight: 'bold',
//               color: 'rgba(0,0,0,0.85)',
//               overflow: 'hidden',
//               textOverflow: 'ellipsis',
//               marginBottom: 2,
//             }}
//           >
//             {ad.title}
//           </strong>

//           <p
//             style={{
//               color: 'rgba(0,0,0,0.65)',
//               marginBottom: 6,
//               lineHeight: 1.2,
//               fontSize: '0.75rem',
//               maxHeight: '2.8em',
//               overflow: 'hidden',
//               textOverflow: 'ellipsis',
//             }}
//           >
//             {ad.description}
//           </p>

//           <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
//             {ad.findOutMoreLink && (
//               <button
//                 onClick={handleFindOutMore}
//                 style={{
//                   padding: '8px 14px',
//                   border: 'none',
//                   borderRadius: 8,
//                   fontSize: '0.92rem',
//                   fontWeight: 600,
//                   color: 'white',
//                   background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease',
//                   boxShadow: '0 2px 8px rgba(59,130,246,0.18)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 4,
//                 }}
//               >
//                 <span>🔗</span> More
//               </button>
//             )}

//             {showRewardButton && (
//               <button
//                 onClick={handleRewardClick}
//                 style={{
//                   padding: '8px 14px',
//                   border: 'none',
//                   borderRadius: 8,
//                   fontSize: '0.92rem',
//                   fontWeight: 600,
//                   color: 'white',
//                   background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease',
//                   boxShadow: '0 2px 8px rgba(16,185,129,0.18)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 4,
//                   animation: 'pulse 2s infinite',
//                 }}
//               >
//                 <span>🎁</span> Reward
//               </button>
//             )}

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 goToAdWebSite(ad);
//               }}
//               style={{
//                 padding: '12px 24px',
//                 border: '2px solid rgba(0,0,0,0.2)',
//                 borderRadius: 12,
//                 fontSize: 14,
//                 fontWeight: 600,
//                 color: 'rgba(0,0,0,0.7)',
//                 backgroundColor: 'transparent',
//                 cursor: 'pointer',
//                 transition: 'all 0.3s ease',
//               }}
//             >
//               <span>🔗</span> Learn More
//             </button>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes pulse {
//           0%, 100% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.8; transform: scale(1.05); }
//         }
//       `}</style>

//       {showRewardModal && RewardModal && (
//         <RewardModal
//           ad={ad}
//           onClose={() => setShowRewardModal(false)}
//           onReward={handleRewardEarned}
//         />
//       )}
//     </div>
//   );
// }, areEqual);

// export default AdImageObject;

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
import { Typography, Box } from '@mui/material';

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

const AdImageObject = memo(function AdImageObject({
  onAdView,
  onAdClick,
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

  // stable keys
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

  // view once per ad
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
      } catch {}
    })();
  }, [ad, adViewed, hasToken, onAdView]);

  const goToAdWebSite = useCallback((theAd) => {
    if (theAd?.link) window.open(theAd.link, '_blank');
  }, []);

  const handleFindOutMore = useCallback(async () => {
    if (!ad?.findOutMoreLink) return;
    try {
      await trackAdCompletion(ad.id, !hasToken);
      onAdClick && onAdClick(ad);
      window.open(ad.findOutMoreLink, '_blank');
    } catch {}
  }, [ad, hasToken, onAdClick]);

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
    } catch {}
  }, [ad, quizQuestion, quizAnswer, selectedOption]);

  const handleRewardEarned = useCallback(
    async (amount) => {
      if (!ad) return;
      try {
        await trackRewardClaim(ad.id, amount);
        onRewardClaim && onRewardClaim(ad, amount);
        setShowRewardModal(false);
      } catch {}
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

  // UI
  if (loading) {
    return (
      <div
        style={{
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          ...style,
        }}
        className={className}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Loading advertisement...</p>
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div
        style={{
          minHeight: '400px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '24px',
          ...style,
        }}
        className={className}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: 48,
            textAlign: 'center',
            maxWidth: 500,
            width: '100%',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 24 }}>{error ? '❌' : '🎉'}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.8)', marginBottom: 16 }}>
            {error ? 'Error Loading Ad' : 'No Ads Available'}
          </h2>
          <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
            {error
              ? 'There was an error loading the advertisement. Please try again later.'
              : 'Great! No ads to display at the moment. Enjoy the ad-free experience!'}
          </p>
          <button
            onClick={handleClose}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (showQuiz && quizQuestion) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          ...style,
        }}
        className={className}
        data-style-key={styleKey}
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
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)',
        borderRadius: 12,
        padding: 5,
        position: 'relative',
        maxWidth: '100%',
        minWidth: 260,
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        ...style,
      }}
      className={className}
      data-style-key={styleKey}
    >
      <Box sx={{ p: 0.5, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '12px 12px 0 0' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
          Advertisement
        </Typography>
      </Box>

      <div
        style={{
          background: 'white',
          display: 'flex',
          borderRadius: '0 0 12px 12px',
          padding: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
          maxWidth: '100%',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {ad.media_url && (
          <div style={{ marginBottom: 4 }}>
            <img
              src={ad.media_url}
              alt={ad.title}
              style={{ maxHeight: 180, objectFit: 'cover', borderRadius: 8 }}
            />
          </div>
        )}

        <div style={{ padding: '0 10px 4px 10px', margin: 'auto', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
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
              fontSize: '0.75rem',
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
                onClick={handleFindOutMore}
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
                padding: '12px 24px',
                border: '2px solid rgba(0,0,0,0.2)',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: 'rgba(0,0,0,0.7)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <span>🔗</span> Learn More
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>

      {showRewardModal && RewardModal && (
        <RewardModal
          ad={ad}
          onClose={() => setShowRewardModal(false)}
          onReward={handleRewardEarned}
        />
      )}
    </div>
  );
}, areEqual);

export default AdImageObject;

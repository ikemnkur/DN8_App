import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPreviewAd, fetchAdvertiserProfile } from '../components/api'; // Adjust the import path as necessary

const AdServiceHomePage = ({ authToken, onActivationComplete,  }) => {
  const navigate = useNavigate();
  const [userStatus, setUserStatus] = useState({
    isEnrolled: false,
    isLoading: true,
    userInfo: null,
    error: null
  });
  const [activationStep, setActivationStep] = useState(1);
  const [isActivating, setIsActivating] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const userData = JSON.parse(localStorage.getItem('userdata'));
  const [currentUser, setCurrentUser] = useState(userData);
  // Get auth token from localStorage if not provided as prop
  const token = authToken || localStorage.getItem('authToken');
  const API_BASE_URL = process.env.REACT_APP_API_SERVER_URL + "/api" || 'http://localhost:5001/api';

  

  useEffect(() => {
    console.log('Current user data:', userData);
    checkUserEnrollment();
  }, []);

  const checkUserEnrollment = async () => {
    // if (!token) {
    //   setUserStatus({
    //     isEnrolled: false,
    //     isLoading: false,
    //     userInfo: null,
    //     error: 'Authentication required'
    //   });
    //   return;
    // }

    try {

      // code for server-side API endpoint:
      // // Get user profile api endpoint on server
      // app.post('/user/profile', async (req, res) => {

      //   const { user_id } = req.body;

      //   // console.log("userdata for ad:", userdata);
      //   console.log("user_id for ad:", user_id);

      //   try {
      //     const users = await executeQuery(
      //       'SELECT id, name, email, credits, created_at FROM advertisers WHERE user_id = ?',
      //       [user_id]
      //     );

      //     if (users.length === 0) {
      //       return res.status(404).json({ error: 'User not found' });
      //     }

      //     res.json({ user: users[0] });
      //     console.log("User AD profile:", users[0]);
      //   } catch (error) {
      //     console.error('Get profile error:', error);
      //     res.status(500).json({ error: 'Internal server error' });
      //   }
      // });

      // const response = await fetchAdvertiserProfile();
      const response = await fetch(`${API_BASE_URL}/ads/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          userdata: currentUser,
          user_id: currentUser.user_id
        })
      });
      
      console.log('Advertiser profile response:', response);

      // if (!response.ok) {
      //   throw new Error('Failed to fetch user profile');
      // }

      

      const data = await response.json();
      
      // // Check if user has ad service features (you might need to add this field to your database)
      // // For now, we'll assume if they have credits, they're enrolled
      const isEnrolled = data.user && data.user.credits !== undefined;
      console.log('User enrollment status:', isEnrolled, data.user);

      setTimeout(() => {
        setUserStatus({
          isEnrolled,
          isLoading: false,
          userInfo: data.user,
          error: null
        });
      }, 750);

    } catch (error) {
      console.error('Error checking enrollment:', error);
      setUserStatus({
        isEnrolled: false,
        isLoading: false,
        userInfo: null,
        error: error.message
      });
    }
  };


  const handleActivateService = async () => {
    // setIsActivating(true);

    
    try {

      setUserStatus({
        isEnrolled,
        isLoading: false,
        userInfo: data.user,
        error: null
      });

      setTimeout(() => {
        if (onActivationComplete) {
          onActivationComplete();
           navigate('/ads-join'); // or '/ads-service'
        } else {
          // Navigate to ads dashboard or join page
          navigate('/ads-join'); // or '/ads-service'
        }
      }, 2000);

    } catch (error) {
      console.error('Activation error:', error);
      setNotification({
        show: true,
        message: error.message || 'Failed to activate ad service',
        type: 'error'
      });
    } finally {
      setIsActivating(false);
    }
  };

  const benefits = [
    {
      icon: '🎯',
      title: 'Targeted Advertising',
      description: 'Reach your ideal audience with precision targeting and advanced analytics.'
    },
    {
      icon: '💰',
      title: 'Flexible Budgeting',
      description: 'Set budgets from 2,000 to 20,000 credits with full control over spending.'
    },
    {
      icon: '🧠',
      title: 'Interactive Quizzes',
      description: 'Engage users with quiz-based rewards to ensure genuine attention.'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Track performance with detailed metrics and optimize campaigns.'
    },
    {
      icon: '🚀',
      title: 'Multiple Formats',
      description: 'Choose from video, audio, banner, popup, and standard ad formats.'
    },
    {
      icon: '⭐',
      title: 'Reward System',
      description: 'Incentivize engagement with credit rewards for quiz completion.'
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Account Verification',
      description: 'Verify your account details and initialize your advertiser profile.',
      icon: '👤'
    },
    {
      number: 2,
      title: 'Service Activation',
      description: 'Activate the advertising service and receive your starting credits.',
      icon: '🔓'
    },
    {
      number: 3,
      title: 'Create Your First Ad',
      description: 'Design and launch your first advertising campaign.',
      icon: '🎨'
    }
  ];

  if (userStatus.isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #667eea',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            margin: '0 auto 24px',
            animation: 'spin 1s linear infinite'
          }} />
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px 0', color: 'rgba(0, 0, 0, 0.8)' }}>
            Checking Account Status
          </h2>
          <p style={{ color: 'rgba(0, 0, 0, 0.6)', margin: 0 }}>
            Please wait while we verify your account...
          </p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (userStatus.isEnrolled) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                Ad Service Active
              </h1>
              <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.9 }}>
                Welcome back, {userStatus.userInfo?.name || 'Advertiser'}!
              </p>
            </div>

            {/* Content */}
            <div style={{ padding: '32px' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '2px solid rgba(16, 185, 129, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  margin: '0 0 16px 0',
                  color: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>💰</span>
                  Account Status
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>
                      <strong>Available Credits:</strong>
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                      {userStatus.userInfo?.credits?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>
                      <strong>Account Type:</strong>
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '1rem', fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.8)' }}>
                      Premium Advertiser
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>
                      <strong>Member Since:</strong>
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '1rem', fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.8)' }}>
                      {userStatus.userInfo?.created_at ? new Date(userStatus.userInfo.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: 'rgba(0, 0, 0, 0.8)' }}>
                  Ready to Create Your Next Campaign?
                </h3>
                <p style={{ color: 'rgba(0, 0, 0, 0.6)', marginBottom: '24px', lineHeight: 1.6 }}>
                  Your ad service is active and ready to go. Start creating engaging advertisements that convert!
                </p>
                <button
                  // onClick={() => onActivationComplete && onActivationComplete()}
                  onClick={
                    // open link in new tab
                    () => window.open('/ads-login', '_blank')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  🚀 Go to Ad Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

 
};

export default AdServiceHomePage;
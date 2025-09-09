import React, { useState, useEffect } from 'react';
import { fetchAdvertiserProfile, fetchAds } from '../components/api'; // Adjust the import path as necessary

const AdDashboardPage = ({ ads = [], onEditAd }) => {
  const [selectedAd, setSelectedAd] = useState(null);

  console.log('AdDashboardPage ads:', ads);

  // const [ads, setAds] = useState([]); // Initialize with empty array

  const totalSpent = ads.reduce((sum, ad) => sum + ad.spent, 0);
  const totalViews = ads.reduce((sum, ad) => sum + ad.views, 0);
  const totalCompletions = ads.reduce((sum, ad) => sum + ad.completions, 0);
  const activeAds = ads.filter(ad => ad.active).length;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user, setUser] = useState({
     name:  JSON.parse(localStorage.getItem('advertiserData')).name,
     email: JSON.parse(localStorage.getItem('advertiserData')).email,
     credits: JSON.parse(localStorage.getItem('advertiserData')).credits,
     profileImage: JSON.parse(localStorage.getItem('userdata')).profileImage,
     token: localStorage.getItem('authToken') || '' // Get token from localStorage
   });
   
  const summaryCards = [
    {
      title: 'Total Spent',
      value: totalSpent,
      icon: '💰',
      color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    {
      title: 'Total Views',
      value: totalViews,
      icon: '👁️',
      color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      title: 'Completions',
      value: totalCompletions,
      icon: '📈',
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Active Ads',
      value: activeAds,
      icon: '🎯',
      color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];


  // Fetch ads from the server
  const ADS_fetchAds = async () => {
    if (!user.token) {
      return;
    }

    try {

      const response = await fetchAds(user);
    
      // console.log('Fetch Ads response:', response);

      // const data = await response.json();

      console.log('Fetch Ads data:', response.ads);

      if (response) {
        // Transform server data to match expected format
        const transformedAds = response.ads.map(ad => ({
          ...ad,
          views: parseInt(ad.views) || 0,
          completions: parseInt(ad.completions) || 0,
          spent: parseFloat(ad.spent) || 0,
          budget: parseFloat(ad.budget) || 0,
          reward: parseFloat(ad.reward) || 0,
          active: Boolean(ad.active),
          createdAt: ad.created_at ? new Date(ad.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          quiz: ad.quiz ? JSON.parse(ad.quiz) : []
        }));
        // setAds(transformedAds);
      } else {
        console.error('Failed to fetch ads:', response.ads);
        setError('Failed to fetch ads');
      }

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || 'Failed to fetch ad');
      // }

    } catch (error) {
      console.error('Error fetching ads:', error);
      setError('Network error while fetching ads');
    } finally {
      setLoading(false);
    }
  };

  const ADS_fetchAdvertiserProfile = async () => {
    if (!user.token) {
      setLoading(false);
      setError('No authentication token found');
      return;
    }

    try {

      console.log("Fetching advertiser profile with these user details:", user);
      const response = await fetchAdvertiserProfile(user);
      // await fetchAds(user);
      console.log('Fetch Advertiser Profile response:', response.user);
      // const data = await response.json();

      // console.log("response ok status:", response.ok);

      if (response) {
        // Based on the commented API, the response structure is { user: userData }
        // setUser(prevUser => ({
        //   ...prevUser,
        //   ...response.user,
        //   token: prevUser.token // Keep the token
        // }));
        setUser(response.user);
        console.log('Advertiser profile fetched successfully:', response.user);
      } else {
        console.error('Failed to fetch advertiser profile:', response.user);
        setError('Failed to fetch user profile');
      }

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || 'Failed to fetch advertiser profile');
      // }

    } catch (error) {
      console.error('Error fetching advertiser profile:', error);
      setError('Network error while fetching profile');
    }
  };

  // Load data on component mount and when token changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (user.token) {
        await ADS_fetchAdvertiserProfile();
        // await ADS_fetchAds();
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [user.token]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,rgb(210, 216, 247) 0%,rgb(187, 167, 208) 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>

          {/* banner to show credits and username/email */}

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '2px solid rgba(16, 185, 129, 0.2)',
              fontWeight: 600
            }}>
              <span style={{ fontSize: '16px' }}>💰</span>
              <span>{user.credits ? user.credits.toLocaleString() : 0} Credits</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}>
                👤
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'rgba(0, 0, 0, 0.8)'
                }}>
                  {user.name || 'Loading...'}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(0, 0, 0, 0.5)'
                }}>
                  {user.email || ''}
                </div>

              </div>
            </div>
          </div>

          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            color: 'white',
            fontSize: '40px'
          }}>
            📊
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            Dashboard
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.25rem',
            maxWidth: '600px',
            margin: '0 auto',
            fontWeight: 400,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Track your ad performance and optimize your campaigns
          </p>
        </div>



        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {summaryCards.map((card, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                padding: '32px 24px',
                border: 'none',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(0, 0, 0, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
              }}
            >
              {/* Background decoration */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: card.bgColor,
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
                opacity: 0.3
              }} />

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                position: 'relative',
                zIndex: 1
              }}>
                <div>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.6)',
                    marginBottom: '8px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {card.title}
                  </p>
                  <p style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    margin: 0,
                    background: card.color,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {card.value.toLocaleString()}
                  </p>
                </div>
                <div style={{
                  fontSize: '32px',
                  padding: '12px',
                  background: card.bgColor,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

       
        {/* Detailed View Modal */}
        {selectedAd && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px 32px',
                borderRadius: '24px 24px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  {selectedAd.title}
                </h3>
                <button
                  onClick={() => setSelectedAd(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '32px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '24px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '2px solid rgba(102, 126, 234, 0.1)'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'rgba(0, 0, 0, 0.6)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Campaign Details
                    </h4>
                    <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(0, 0, 0, 0.7)' }}>
                      <p style={{ margin: '4px 0' }}><strong>Format:</strong> {selectedAd.format}</p>
                      <p style={{ margin: '4px 0' }}><strong>Budget:</strong> {selectedAd.budget} credits</p>
                      <p style={{ margin: '4px 0' }}><strong>Spent:</strong> {selectedAd.spent} credits</p>
                      <p style={{ margin: '4px 0' }}><strong>Remaining:</strong> {selectedAd.budget - selectedAd.spent} credits</p>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '2px solid rgba(16, 185, 129, 0.1)'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'rgba(0, 0, 0, 0.6)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Performance
                    </h4>
                    <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(0, 0, 0, 0.7)' }}>
                      <p style={{ margin: '4px 0' }}><strong>Views:</strong> {selectedAd.views}</p>
                      <p style={{ margin: '4px 0' }}><strong>Completions:</strong> {selectedAd.completions}</p>
                      <p style={{ margin: '4px 0' }}><strong>Completion Rate:</strong> {selectedAd.views > 0 ? ((selectedAd.completions / selectedAd.views) * 100).toFixed(1) : 0}%</p>
                      <p style={{ margin: '4px 0' }}><strong>Cost per View:</strong> {selectedAd.views > 0 ? (selectedAd.spent / selectedAd.views).toFixed(2) : 0} credits</p>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(245, 158, 11, 0.05)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '2px solid rgba(245, 158, 11, 0.1)',
                  marginBottom: '32px'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    color: 'rgba(0, 0, 0, 0.8)'
                  }}>
                    Quiz Questions ({selectedAd.quiz?.length || 0})
                  </h4>
                  {selectedAd.quiz?.map((question, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        border: '1px solid rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <p style={{
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: 'rgba(0, 0, 0, 0.8)'
                      }}>
                        {index + 1}. {question.question}
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: 'rgba(0, 0, 0, 0.6)',
                        margin: 0
                      }}>
                        Type: {question.type}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    onClick={() => {
                      onEditAd(selectedAd);
                      setSelectedAd(null);
                    }}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'white',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    Edit Ad
                  </button>
                  <button
                    onClick={() => setSelectedAd(null)}
                    style={{
                      padding: '12px 24px',
                      border: '2px solid rgba(0, 0, 0, 0.2)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'rgba(0, 0, 0, 0.7)',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdDashboardPage;
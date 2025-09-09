import React, { useState, useEffect } from 'react';

import CreateAdPage from '../pages/CreateAdPage';
import AdPreviewPage from '../pages/AdPreviewPage';
import AdAnalyticsPage from './AdAnalyticsPage';
import ManageAdsPage from '../pages/ManageAdsPage';
import AdHelpPage from '../pages/AdHelpPage';
import AdDashboardPage from './AdDashboardPage';
import AdAccountPage from '../pages/AdAccountPage';

import { fetchAds, fetchAdvertiserProfile } from '../components/api';
import { Button } from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_SERVER_URL + "/api" || 'http://localhost:5001/api';

const Ads = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [ads, setAds] = useState([]); // Initialize with empty array
  const [editingAd, setEditingAd] = useState(null);
  const [user, setUser] = useState({
    name:  JSON.parse(localStorage.getItem('advertiserData')).name,
    email: JSON.parse(localStorage.getItem('advertiserData')).email,
    credits: JSON.parse(localStorage.getItem('advertiserData')).credits,
    profileImage: JSON.parse(localStorage.getItem('userdata')).profileImage,
    token: localStorage.getItem('authToken') || '' // Get token from localStorage
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'create', label: 'Create Ad', icon: '➕' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'manage', label: 'Manage Ads', icon: '⚙️' },
    { id: 'help', label: 'Help', icon: '❓' },
    { id: "account", label: "Account", icon: "👤" },
  ];

  // Check to see if user is logged in
  useEffect(() => {
    let lastLoginTime = localStorage.getItem('lastLoginTime');
    let expired = false;
    if (lastLoginTime) {
      const now = new Date();
      const lastLogin = new Date(lastLoginTime);
      const timeDiff = now - lastLogin; // Difference in milliseconds
      const diffMinutes = Math.floor(timeDiff / 1000 / 60); // Convert to minutes
      if (diffMinutes < 5) {
        console.log('User logged in recently, refreshing ads...');
        ADS_fetchAds();
      }
      if (diffMinutes > 60) {
        console.log('User session expired, redirecting to login...');
        expired = true;
      } 
    }
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || localStorage.getItem('token');
    console.log('User token:', token, 'Expired:', expired);
    if (token && !expired) {
      setUser(prev => ({ ...prev, token }));
      console.log('User token found:', token);
    } else {
      console.log('No user token found, redirecting to login');
      // alert('Your session has expired. Please log in again.');
      window.location.href = '/ads-login'; // Redirect to login page
    }
  }, []);

  const ADS_fetchAdvertiserProfile = async () => {
    if (!user.token) {
      setLoading(false);
      setError('No authentication token found');
      return;
    }

    try {
      console.log("Fetching advertiser profile with these user details:", user);
      // setUser(
      //   us
      // )

      // const response = await fetchAdvertiserProfile({
      //   email: user.email,
      //   token: user.token
      // });
      // await fetchAds(user);
      // console.log('Fetch Advertiser Profile response:', response.user);
      // const data = await response.json();

      // console.log("response ok status:", response.ok);

      // if (response) {
        // Based on the commented API, the response structure is { user: userData }
        // setUser(prevUser => ({
        //   ...prevUser,
        //   ...response.user,
        //   token: prevUser.token // Keep the token
        // }));
      //   setUser(response.user);
      //   console.log('Advertiser profile fetched successfully:', response.user);
      // } else {
      //   console.error('Failed to fetch advertiser profile:', response.user);
      //   setError('Failed to fetch user profile');
      // }

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || 'Failed to fetch advertiser profile');
      // }

    } catch (error) {
      console.error('Error fetching advertiser profile:', error);
      setError('Network error while fetching profile');
    }
  };





  // Fetch ads from the server
  const ADS_fetchAds = async () => {
    if (!user.token) {
      return;
    }

    try {

      const response = await fetchAds(user);

      // console.log('Fetch Ads response:', response);

      // const data = await response.json();

      console.log('Fetch Ads data:', response.data.ads);

      if (response) {
        // Transform server data to match expected format
        const transformedAds = response.data.ads.map(ad => ({
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
        setAds(transformedAds);
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

  // Load data on component mount and when token changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (user.token) {
        // await ADS_fetchAdvertiserProfile();
        setUser({
          name:  JSON.parse(localStorage.getItem('advertiserData')).name,
          email: JSON.parse(localStorage.getItem('advertiserData')).email,
          credits: JSON.parse(localStorage.getItem('advertiserData')).credits,
          profileImage: JSON.parse(localStorage.getItem('userdata')).profileImage,
          token: localStorage.getItem('authToken') || '' // Get token from localStorage
        });
        
        await ADS_fetchAds();
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [user.token]);

  // Handle saving an ad (create or update)
  const handleSaveAd = async (adData) => {
    try {
      console.log('Saving ad data (handleSaveAd - AdsHeader.jsx):', adData);
      const method = editingAd ? 'PUT' : 'POST';
      const url = editingAd
        ? `${API_BASE_URL}/ads/ad/${editingAd.id}`
        : `${API_BASE_URL}/ads/ad`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...adData,
          quiz: JSON.stringify(adData.quiz || [])
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh ads list after successful save
        await fetchAds();
        setEditingAd(null);
        setCurrentPage('analytics');
      } else {
        console.error('Failed to save ad:', data);
        setError('Failed to save ad');
      }
    } catch (error) {
      console.error('Error saving ad:', error);
      setError('Network error while saving ad');
    }
  };

  // Handle editing an ad
  const handleEditAd = (ad) => {
    setEditingAd(ad);
    setCurrentPage('create');
  };

  // Handle deleting an ad
  const handleDeleteAd = async (adId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ad/${adId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        // Remove from local state
        setAds(prev => prev.filter(ad => ad.id !== adId));
      } else {
        const data = await response.json();
        console.error('Failed to delete ad:', data);
        setError('Failed to delete ad');
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
      setError('Network error while deleting ad');
    }
  };

  // Handle toggling ad status
  const handleToggleAdStatus = async (adId) => {
    const ad = ads.find(a => a.id === adId);
    if (!ad) return;

    try {
      const response = await fetch(`${API_BASE_URL}/ad/${adId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...ad,
          active: !ad.active
        })
      });

      if (response.ok) {
        // Update local state
        setAds(prev => prev.map(a =>
          a.id === adId ? { ...a, active: !a.active } : a
        ));
      } else {
        const data = await response.json();
        console.error('Failed to toggle ad status:', data);
        setError('Failed to update ad status');
      }
    } catch (error) {
      console.error('Error toggling ad status:', error);
      setError('Network error while updating ad status');
    }
  };

  // Handle duplicating an ad
  const handleDuplicateAd = async (ad) => {
    const duplicatedAdData = {
      ...ad,
      title: `${ad.title} (Copy)`,
      active: false // Start duplicates as inactive
    };

    // Remove server-specific fields
    delete duplicatedAdData.id;
    delete duplicatedAdData.views;
    delete duplicatedAdData.completions;
    delete duplicatedAdData.spent;
    delete duplicatedAdData.createdAt;
    delete duplicatedAdData.created_at;

    await handleSaveAd(duplicatedAdData);
  };

  // Update user credits (you might want to sync this with server)
  const updateUserCredits = (amount) => {
    setUser(prev => ({
      ...prev,
      credits: prev.credits + amount
    }));
  };

  // Get the most recent ad for preview
  const getPreviewAd = () => {
    return ads.length > 0 ? ads[ads.length - 1] : null;
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ margin: 0, color: '#666' }}>Loading your ads...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !user.token) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ margin: '0 0 10px', color: '#dc2626' }}>Authentication Required</h2>
          <p style={{ margin: 0, color: '#666' }}>Please log in to access the ad management system.</p>
          <Button variant="contained" color="primary" style={{ marginTop: '20px' }}>
            <a href="/ads-login" style={{ textDecoration: 'none', color: 'white' }}>
              Go to Login
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Render the current page
  const renderPage = () => {
    switch (currentPage) {
      case 'create':
        return (
          <CreateAdPage
            onSave={handleSaveAd}
            editingAd={editingAd}
          />
        );
      case 'dashboard':
        return (
          <AdDashboardPage
            ads={ads}
            onEditAd={handleEditAd}
          />
        );
      case 'analytics':
        return (
          <AdAnalyticsPage
            ads={ads}
            onEditAd={handleEditAd}
          />
        );
      case 'manage':
        return (
          <ManageAdsPage
            ads={ads}
            onEditAd={handleEditAd}
            onDeleteAd={handleDeleteAd}
            onToggleAdStatus={handleToggleAdStatus}
            onDuplicateAd={handleDuplicateAd}
          />
        );
      case 'help':
        return <AdHelpPage />;
      
      case 'account':
        return <AdAccountPage />;

      default:
        return (
          <CreateAdPage
            onSave={handleSaveAd}
            editingAd={editingAd}
          />
        );
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Error banner */}
      {error && (
        <div style={{
          background: '#fef2f2',
          borderBottom: '1px solid #fecaca',
          padding: '12px 24px',
          color: '#dc2626',
          fontSize: '14px'
        }}>
          <strong>Error:</strong> {error}
          <button
            onClick={() => setError(null)}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        padding: '16px 0'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                📢
              </div>
              <div>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Ad Management System
                </h1>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: 'rgba(0, 0, 0, 0.6)'
                }}>
                  Create, manage, and optimize your advertising campaigns
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Button onClick={() => {
                localStorage.setItem('authToken', '');
                localStorage.setItem('advertiserData', '');
                localStorage.setItem('lastLoginTime', '');
                sessionStorage.setItem('authToken', '');
              }}>
                <a href="/ads-login" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Logout
                </a>
              </Button>
              <Button>
                <a href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Dashboard
                </a>
              </Button>
              {/* <div style={{ 
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
                <Button>
                    <a href="/logout" style={{ textDecoration: 'none', color: 'inherit' }}>
                      Logout
                    </a>
                  </Button>
                   <Button>
                    <a href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                      Dashboard
                    </a>
                  </Button>
              </div>? */}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {navigationItems.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => {
                  // Clear editing state when navigating away from create
                  if (currentPage === 'create' && id !== 'create') {
                    setEditingAd(null);
                  }
                  setCurrentPage(id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 20px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderBottom: currentPage === id ? '3px solid #667eea' : '3px solid transparent',
                  color: currentPage === id ? '#667eea' : 'rgba(0, 0, 0, 0.6)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== id) {
                    e.target.style.color = 'rgba(0, 0, 0, 0.8)';
                    e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== id) {
                    e.target.style.color = 'rgba(0, 0, 0, 0.6)';
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {renderPage()}
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Ads;
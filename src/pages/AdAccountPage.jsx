import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyCredits } from '../components/api'; // Adjust the import path as necessary

const AdAccountPage = () => {
  const [activeSection, setActiveSection] = useState('credits');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    company: '',
    bio: '',
    website: '',
    credits: 0,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });



  const API_BASE_URL = process.env.REACT_APP_API_SERVER_URL + "/api" || 'http://localhost:5001/api';
  const navigate = useNavigate();

  // Load user data from localStorage
  useEffect(() => {
    const advertiserData = localStorage.getItem('advertiserData');
    if (advertiserData) {
      const data = JSON.parse(advertiserData);
      setUserData(prev => ({
        ...prev,
        name: data.name || '',
        email: data.email || '',
        company: data.company || '',
        bio: data.bio || '',
        website: data.website || '',
        credits: data.credits || 0
      }));
    }
  }, []);

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = (section) => {
    setIsEditing(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSave = async (section) => {
    setIsLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call

      // Update localStorage
      const currentData = JSON.parse(localStorage.getItem('advertiserData') || '{}');
      const updatedData = { ...currentData, ...userData };
      localStorage.setItem('advertiserData', JSON.stringify(updatedData));

      setIsEditing(prev => ({ ...prev, [section]: false }));
      setNotification({
        show: true,
        message: 'Information updated successfully!',
        type: 'success'
      });
    } catch (error) {
      setNotification({
        show: true,
        message: 'Failed to update information. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCredits = async (amount) => {
    if (userData)
    if (confirm('Are you sure you want to purchase ' + amount + ' credits?')) {
      // Mock credit purchase
      const response = await buyCredits(amount, userData.email, userData.user_id, localStorage.getItem('token'));
      console.log('Buy credits response:', response);

      setUserData(prev => ({
        ...prev,
        credits: prev.credits + amount
      }));
      setNotification({
        show: true,
        message: `Successfully purchased ${amount} credits!`,
        type: 'success'
      });
    }
  };

  const sections = {
    credits: {
      title: 'Credits & Billing',
      icon: '💰',
      content: (
        <div style={{ lineHeight: 1.8 }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.05)',
            padding: '24px',
            borderRadius: '16px',
            border: '2px solid rgba(16, 185, 129, 0.1)',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'rgba(0, 0, 0, 0.8)',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span>🏆</span>
              Current Balance
            </h3>
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#059669',
              marginBottom: '8px'
            }}>
              {userData.credits.toLocaleString()} Credits
            </div>
            <p style={{ color: 'rgba(0, 0, 0, 0.6)', margin: 0 }}>
              Available for advertising campaigns
            </p>
          </div>

          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '24px',
            color: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🛒</span>
            Purchase Credits
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {[
              { amount: 5000, price: 5000, priceLabel: '5000 Coins', popular: false },
              { amount: 12500, price: 11000, priceLabel: '11000 Coins', popular: true },
              { amount: 25000, price: 24000, priceLabel: '24000 Coins', popular: false },
              { amount: 55000, price: 53000, priceLabel: '53000 Coins', popular: false }
            ].map((package_, index) => (
              <div
                key={index}
                style={{
                  background: package_.popular ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.7)',
                  color: package_.popular ? 'white' : 'rgba(0, 0, 0, 0.8)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: package_.popular ? 'none' : '2px solid rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => handleBuyCredits(package_.amount, package_.price)}
              >
                {package_.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#f59e0b',
                    color: 'white',
                    padding: '4px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  {package_.amount.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '14px',
                  opacity: 0.8,
                  marginBottom: '16px'
                }}>
                  Credits
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '16px'
                }}>
                  {package_.priceLabel}
                </div>
                <button style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: package_.popular ? 'rgba(255, 255, 255, 0.2)' : '#667eea',
                  color: package_.popular ? 'white' : 'white',
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease'
                }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Purchase Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    },
    profile: {
      title: 'Advertiser Profile',
      icon: '👤',
      content: (
        <div style={{ lineHeight: 1.8 }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid rgba(59, 130, 246, 0.1)',
            marginBottom: '24px'
          }}>
            <h4 style={{
              fontWeight: 'bold',
              marginBottom: '8px',
              color: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>ℹ️</span>
              Profile Information
            </h4>
            <p style={{
              margin: 0,
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px'
            }}>
              This information is displayed to users when they click the info button on your ads.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontWeight: 'bold',
                  margin: 0,
                  color: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🏢</span>
                  Company Information
                </h4>
                <button
                  onClick={() => handleEdit('company')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: isEditing.company ? '#ef4444' : '#667eea',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {isEditing.company ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: 'rgba(0, 0, 0, 0.7)'
                  }}>
                    Company Name
                  </label>
                  {isEditing.company ? (
                    <input
                      type="text"
                      value={userData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '8px',
                      color: 'rgba(0, 0, 0, 0.7)'
                    }}>
                      {userData.company || 'Not set'}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: 'rgba(0, 0, 0, 0.7)'
                  }}>
                    Website
                  </label>
                  {isEditing.company ? (
                    <input
                      type="url"
                      value={userData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '8px',
                      color: 'rgba(0, 0, 0, 0.7)'
                    }}>
                      {userData.website || 'Not set'}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: 'rgba(0, 0, 0, 0.7)'
                  }}>
                    Company Bio
                  </label>
                  {isEditing.company ? (
                    <textarea
                      value={userData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell users about your company..."
                      rows="4"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '8px',
                      color: 'rgba(0, 0, 0, 0.7)',
                      minHeight: '80px'
                    }}>
                      {userData.bio || 'Not set'}
                    </div>
                  )}
                </div>

                {isEditing.company && (
                  <button
                    onClick={() => handleSave('company')}
                    disabled={isLoading}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      backgroundColor: '#10b981',
                      color: 'white',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1
                    }}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    },
    security: {
      title: 'Account Security',
      icon: '🔐',
      content: (
        <div style={{ lineHeight: 1.8 }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.05)',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid rgba(239, 68, 68, 0.1)',
            marginBottom: '24px'
          }}>
            <h4 style={{
              fontWeight: 'bold',
              marginBottom: '8px',
              color: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              Security Notice
            </h4>
            <p style={{
              margin: 0,
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '14px'
            }}>
              Keep your login credentials secure. Never share your password with others.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontWeight: 'bold',
                  margin: 0,
                  color: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📧</span>
                  Email Address
                </h4>
                <button
                  onClick={() => handleEdit('email')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: isEditing.email ? '#ef4444' : '#667eea',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {isEditing.email ? 'Cancel' : 'Change'}
                </button>
              </div>

              {isEditing.email ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="New email address"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => handleSave('email')}
                    disabled={isLoading}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      backgroundColor: '#10b981',
                      color: 'white',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1
                    }}
                  >
                    {isLoading ? 'Updating...' : 'Update Email'}
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '8px',
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontSize: '14px'
                }}>
                  {userData.email}
                </div>
              )}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h4 style={{
                  fontWeight: 'bold',
                  margin: 0,
                  color: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🔑</span>
                  Password
                </h4>
                <button
                  onClick={() => handleEdit('password')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: isEditing.password ? '#ef4444' : '#667eea',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {isEditing.password ? 'Cancel' : 'Change'}
                </button>
              </div>

              {isEditing.password ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <input
                    type="password"
                    value={userData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Current password"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="password"
                    value={userData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="New password"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="password"
                    value={userData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={() => handleSave('password')}
                    disabled={isLoading || userData.newPassword !== userData.confirmPassword}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      backgroundColor: '#10b981',
                      color: 'white',
                      cursor: (isLoading || userData.newPassword !== userData.confirmPassword) ? 'not-allowed' : 'pointer',
                      opacity: (isLoading || userData.newPassword !== userData.confirmPassword) ? 0.6 : 1
                    }}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '8px',
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontSize: '14px'
                }}>
                  Password last changed: Never
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  };

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,rgb(210, 216, 247) 0%,rgb(187, 167, 208) 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Notification */}
        {notification.show && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: notification.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            fontWeight: 'bold'
          }}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
            ⚙️
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
            Account Settings
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.25rem',
            maxWidth: '600px',
            margin: '0 auto',
            fontWeight: 400,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Manage your advertising account and preferences
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '24px',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {/* Navigation Sidebar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '32px 24px',
            height: 'fit-content',
            position: 'sticky',
            top: '24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '24px',
              color: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📑</span>
              Settings
            </h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(sections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: activeSection === key ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    color: activeSection === key ? '#667eea' : 'rgba(0, 0, 0, 0.7)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== key) {
                      e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== key) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{section.icon}</span>
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>{sections[activeSection].icon}</span>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                {sections[activeSection].title}
              </h2>
            </div>

            <div style={{ padding: '32px' }}>
              {sections[activeSection].content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdAccountPage;
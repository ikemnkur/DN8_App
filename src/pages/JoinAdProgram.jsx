import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationPage = ({ onRegistrationSuccess, onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_SERVER_URL + "/api" || 'http://localhost:5001/api';


  const features = [
    {
      icon: '🎯',
      title: 'Smart Targeting',
      description: 'Reach the right audience with advanced targeting options'
    },
    {
      icon: '💰',
      title: '5,000 Free Credits',
      description: 'Start with 5,000 credits to launch your first campaigns'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Track performance with detailed insights and metrics'
    },
    {
      icon: '🧠',
      title: 'Quiz-based Engagement',
      description: 'Ensure genuine attention with interactive quiz rewards'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) {
      setNotification({
        show: true,
        message: 'Please fix the errors in the form',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ads/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          Business_Name: formData.Business_Name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          website: formData.website.trim(),
          Biz_Bio: formData.Biz_Bio.trim(),
          phone: formData.phone.trim(),
          country: formData.country.trim(),
          state: formData.state.trim(),
          city: formData.city.trim(),
          address: formData.address.trim(),
          zip: formData.zip.trim(),
          //

          user_id: localStorage.getItem('userdata').user_id || null // Optional user_id if needed
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store auth token
      localStorage.setItem('authToken', data.token);
      
      setNotification({
        show: true,
        message: 'Account created successfully! Welcome to our platform!',
        type: 'success'
      });

      // FIXED: Call success callback if provided, otherwise navigate directly
      if (onRegistrationSuccess) {
        setTimeout(() => {
          onRegistrationSuccess(data);
        }, 1000);
      } else {
        // Navigate directly if no callback provided
        setTimeout(() => {
          navigate('/ads-login'); // or wherever you want to redirect
        }, 1000);
      }

    } catch (error) {
      console.error('Registration error:', error);
      setNotification({
        show: true,
        message: error.message || 'Failed to create account. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '#e5e7eb' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { strength: 33, label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { strength: 66, label: 'Medium', color: '#f59e0b' };
    return { strength: 100, label: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div 
    // onSignInSuccess={(userData) => {
    //     // Custom logic after sign in
    //     console.log('User signed in:', userData);
        
    //     // Redirect based on user role or preference
    //     if (userData.user.role === 'admin') {
    //       navigate('/admin-dashboard');
    //     } else {
    //       navigate('/dashboard');
    //     }
    //   }}

    //  onNavigateToLogin={() => {
    //     navigate('/ads-login');
    //   }}

    style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #66beeaff 0%, #764ba2 100%)',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
      
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        width: '100%',
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 1fr' : '1fr',
        gap: '32px',
        alignItems: 'center'
      }}>
        {/* Left Side - Features (Hidden on mobile) */}
        {window.innerWidth >= 1024 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px 32px',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                margin: '0 0 16px 0',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                Join Our Platform
              </h1>
              <p style={{ 
                fontSize: '1.1rem', 
                opacity: 0.9,
                margin: 0,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>
                Create engaging ad campaigns and reach your target audience
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {features.map((feature, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 'bold', 
                      margin: '0 0 8px 0' 
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      opacity: 0.8, 
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Side - Registration Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}>
          {/* Form Header */}
                <div style={{
                background: 'linear-gradient(135deg, #4a5edeff 0%, #764ba2 100%)',
                color: 'white',
                padding: '32px',
                textAlign: 'center'
                }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '28px'
                }}>
                  👤
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Create Your Account
                </h2>
                <p style={{ opacity: 0.9, margin: 0 }}>
                  Join thousands of successful advertisers
                </p>
                </div>

                {/* Form Content */}
                <div style={{ padding: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Business Name */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter the Name of your Business"
                    disabled={isLoading}
                    style={{
                    width: '100%',
                    padding: '16px',
                    border: `2px solid ${errors.name ? '#ef4444' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: errors.name ? 'rgba(239, 68, 68, 0.05)' : 'white',
                    boxSizing: 'border-box'
                    }}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                    }}
                    onFocus={(e) => {
                    if (!errors.name) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                    }
                    }}
                    onBlur={(e) => {
                    if (!errors.name) {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }
                    }}
                  />
                  {errors.name && (
                    <p style={{ 
                    color: '#ef4444', 
                    fontSize: '14px', 
                    margin: '8px 0 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                    }}>
                    ⚠️ {errors.name}
                    </p>
                  )}
                  </div>
                  {/* Full Name */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.Business_Name}
                    onChange={(e) => handleInputChange('Business_Name', e.target.value)}
                    placeholder="Enter the Name of your Business"
                    disabled={isLoading}
                    style={{
                    width: '100%',
                    padding: '16px',
                    border: `2px solid ${errors.name ? '#ef4444' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: errors.name ? 'rgba(239, 68, 68, 0.05)' : 'white',
                    boxSizing: 'border-box'
                    }}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                    }}
                    onFocus={(e) => {
                    if (!errors.name) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                    }
                    }}
                    onBlur={(e) => {
                    if (!errors.name) {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }
                    }}
                  />
                  {errors.name && (
                    <p style={{ 
                    color: '#ef4444', 
                    fontSize: '14px', 
                    margin: '8px 0 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                    }}>
                    ⚠️ {errors.name}
                    </p>
                  )}
                  </div>

                  {/* Email */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    disabled={isLoading}
                    style={{
                    width: '100%',
                    padding: '16px',
                    border: `2px solid ${errors.email ? '#ef4444' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: errors.email ? 'rgba(239, 68, 68, 0.05)' : 'white',
                    boxSizing: 'border-box'
                    }}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                    }}
                    onFocus={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                    }
                    }}
                    onBlur={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }
                    }}
                  />
                  {errors.email && (
                    <p style={{ 
                    color: '#ef4444', 
                    fontSize: '14px', 
                    margin: '8px 0 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                    }}>
                    ⚠️ {errors.email}
                    </p>
                  )}
                  </div>

                  {/* Website */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Website
                  </label>
                  <input
                    type="text"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="Enter your business website"
                    disabled={isLoading}
                    style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                    }}
                  />
                  </div>

                  {/* Business Bio */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Business Bio
                  </label>
                  <textarea
                    value={formData.Biz_Bio || ''}
                    onChange={(e) => handleInputChange('Biz_Bio', e.target.value)}
                    placeholder="Describe your business"
                    disabled={isLoading}
                    style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                    minHeight: '60px'
                    }}
                  />
                  </div>

                  {/* Phone */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                    style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                    }}
                  />
                  </div>

                  {/* Country */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Country"
                    disabled={isLoading}
                    style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                    }}
                  />
                  </div>

                  {/* State */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    disabled={isLoading}
                    style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                    }}
                  />
                  </div>

                  {/* City */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    disabled={isLoading}
                    style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                    }}
                  />
                  </div>

                  {/* Address */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street address"
                    disabled={isLoading}
                    style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                    }}
                  />
                  </div>

                  {/* Zip */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Zip/Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.zip || ''}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    placeholder="Zip or postal code"
                    disabled={isLoading}
                    style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                    }}
                  />
                  </div>

                  {/* Password */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '16px 50px 16px 16px',
                      border: `2px solid ${errors.password ? '#ef4444' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: errors.password ? 'rgba(239, 68, 68, 0.05)' : 'white',
                      boxSizing: 'border-box'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit();
                    }}
                    onFocus={(e) => {
                      if (!errors.password) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.password) {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                      e.target.style.boxShadow = 'none';
                      }
                    }}
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: 'rgba(0, 0, 0, 0.5)'
                    }}
                    >
                    {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div style={{ marginTop: '8px' }}>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                      width: `${passwordStrength.strength}%`,
                      height: '100%',
                      backgroundColor: passwordStrength.color,
                      transition: 'all 0.3s ease'
                      }} />
                    </div>
                    <p style={{
                      fontSize: '12px',
                      color: passwordStrength.color,
                      margin: '4px 0 0 0',
                      fontWeight: 'bold'
                    }}>
                      Password strength: {passwordStrength.label}
                    </p>
                    </div>
                  )}

                  {errors.password && (
                    <p style={{ 
                    color: '#ef4444', 
                    fontSize: '14px', 
                    margin: '8px 0 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                    }}>
                    ⚠️ {errors.password}
                    </p>
                  )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.7)',
                    marginBottom: '8px'
                  }}>
                    Confirm Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '16px 50px 16px 16px',
                      border: `2px solid ${errors.confirmPassword ? '#ef4444' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: errors.confirmPassword ? 'rgba(239, 68, 68, 0.05)' : 'white',
                      boxSizing: 'border-box'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmit();
                    }}
                    onFocus={(e) => {
                      if (!errors.confirmPassword) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.confirmPassword) {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                      e.target.style.boxShadow = 'none';
                      }
                    }}
                    />
                    <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: 'rgba(0, 0, 0, 0.5)'
                    }}
                    >
                    {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p style={{ 
                    color: '#ef4444', 
                    fontSize: '14px', 
                    margin: '8px 0 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                    }}>
                    ⚠️ {errors.confirmPassword}
                    </p>
                  )}
                  </div>
                  
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: isLoading 
                    ? 'rgba(102, 126, 234, 0.5)' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {isLoading && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                <span>{isLoading ? 'Creating Account...' : '🚀 Create Account'}</span>
              </button>

              {/* Login Link */}
              <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                <p style={{ color: 'rgba(0, 0, 0, 0.6)', margin: '0 0 8px 0' }}>
                  Already have an account?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToLogin) {
                        onNavigateToLogin();
                    } else {
                        navigate('/ads-login'); // Direct navigation
                    }
                }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#5a67d8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#667eea';
                  }}
                >
                  Sign in here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: notification.type === 'success' 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          maxWidth: '400px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default RegistrationPage;
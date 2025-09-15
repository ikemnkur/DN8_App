import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignInPage = ({ onSignInSuccess, onNavigateToRegister }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [showPassword, setShowPassword] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_SERVER_URL + "/api" || 'http://localhost:5001/api';

    const features = [
        {
            icon: '🚀',
            title: 'Welcome Back',
            description: 'Continue building amazing advertising campaigns'
        },
        {
            icon: '📊',
            title: 'Track Performance',
            description: 'Monitor your campaigns with real-time analytics'
        },
        {
            icon: '💰',
            title: 'Manage Budget',
            description: 'Control your spending with flexible budget options'
        },
        {
            icon: '🎯',
            title: 'Reach Your Audience',
            description: 'Connect with your target market effectively'
        }
    ];

    useEffect(() => {
        // Validate Token
        let lastLoginTime = localStorage.getItem('lastLoginTime');
        let expired = false;
        if (lastLoginTime) {
            lastLoginTime = new Date(lastLoginTime);
            const currentTime = new Date();
            const timeDiff = currentTime - lastLoginTime;
            const diffMinutes = Math.floor(timeDiff / 1000 / 60);
            if (diffMinutes > 60) {
                expired = true;
                localStorage.setItem('authToken', '');
                localStorage.setItem('advertiserData', '');
                localStorage.setItem('lastLoginTime', '');
                sessionStorage.setItem('authToken', '');
                setNotification({
                    show: true,
                    message: 'Session expired. Please log in again.',
                    type: 'error'
                });
            }
        }

        // Check if user is already logged in
        const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const advertiserData = localStorage.getItem('advertiserData');
        if (authToken && advertiserData && !expired) {
            // User is logged in, redirect to ads service or dashboard
            // navigate('/ads-service'); // or wherever you want to redirect
            // alert('You are already logged in. Redirecting to Ads Service...');
            setNotification({
                show: true,
                message: 'You are already logged in. Redirecting to Ads Service...',
                type: 'info'
            });
            setTimeout(() => {

                navigate('/ads-service'); // or wherever you want to redirect

            }, 2000); // Simulate loading delay
        } else {
            // User is not logged in, show the sign-in form
            setNotification({
                show: true,
                message: 'Please sign in to continue',
                type: 'info'
            });
            setTimeout(() => {

                navigate('/ads-login'); // or wherever you want to redirect

            }, 1000); // Simulate loading delay

        }
    }, []);

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

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
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
            const response = await fetch(`${API_BASE_URL}/ads/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Sign in failed');
            }

            // Store auth token
            if (formData.rememberMe) {
                localStorage.setItem('authToken', data.token);
            } else {
                sessionStorage.setItem('authToken', data.token);
            }

            // Store user data
            localStorage.setItem('advertiserData', JSON.stringify(data.user));

            setNotification({
                show: true,
                message: `Welcome back, ${data.user.name}!`,
                type: 'success'
            });

            // Update last login time
            localStorage.setItem('lastLoginTime', new Date().toISOString());
            localStorage.setItem('authToken', data.token);

            // FIXED: Call success callback if provided, otherwise navigate directly
            if (onSignInSuccess) {
                setTimeout(() => {
                    onSignInSuccess(data);
                }, 1000);
            } else {
                // Navigate directly if no callback provided
                setTimeout(() => {
                    navigate('/ads-service'); // or wherever you want to redirect
                }, 1000);
            }


        } catch (error) {
            console.error('Sign in error:', error);
            setNotification({
                show: true,
                message: error.message || 'Failed to sign in. Please check your credentials.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        setNotification({
            show: true,
            message: 'Password reset functionality coming soon!',
            type: 'info'
        });
    };

    return (
        <div
            // onNavigateToRegister={() => {
            //     navigate('/register');
            // }}
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                {/* Left Side - Welcome Message (Hidden on mobile) */}
                {window.innerWidth >= 1024 && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '48px 32px',
                        color: 'white'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '24px' }}>👋</div>
                            <h1 style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                margin: '0 0 16px 0',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }}>
                                Welcome Back!
                            </h1>
                            <p style={{
                                fontSize: '1.1rem',
                                opacity: 0.9,
                                margin: 0,
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                            }}>
                                Sign in to continue managing your advertising campaigns
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

                {/* Right Side - Sign In Form */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden'
                }}>
                    {/* Form Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                            🔐
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                            Sign In
                        </h2>
                        <p style={{ opacity: 0.9, margin: 0 }}>
                            Access your advertising dashboard
                        </p>
                    </div>

                    {/* Form Content */}
                    <div style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                                        placeholder="Enter your password"
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

                            {/* Remember Me & Forgot Password */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '12px'
                            }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: 'rgba(0, 0, 0, 0.7)'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            accentColor: '#667eea'
                                        }}
                                    />
                                    Remember me
                                </label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#667eea',
                                        fontSize: '14px',
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
                                    Forgot Password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
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
                                <span>{isLoading ? 'Signing In...' : '🚀 Sign In'}</span>
                            </button>

                            {/* Demo Credentials (Remove in production) */}
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.05)',
                                border: '2px solid rgba(59, 130, 246, 0.1)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginTop: '8px'
                            }}>
                                <p style={{
                                    fontSize: '12px',
                                    color: 'rgba(0, 0, 0, 0.6)',
                                    margin: '0 0 8px 0',
                                    fontWeight: 'bold'
                                }}>
                                    💡 Example Credentials (Your ad account can have different credentials from your main account):
                                </p>
                                <p style={{
                                    fontSize: '12px',
                                    color: 'rgba(0, 0, 0, 0.6)',
                                    margin: '0',
                                    fontFamily: 'monospace'
                                }}>
                                    Email: demo@example.com<br />
                                    Password: Demo123!
                                </p>
                            </div>

                            {/* Register Link */}
                            <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                                <p style={{ color: 'rgba(0, 0, 0, 0.6)', margin: '0 0 8px 0' }}>
                                    Don't have an account?
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (onNavigateToRegister) {
                                            onNavigateToRegister();
                                        } else {
                                            navigate('/ads-join'); // Direct navigation
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
                                    Create account here
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
                        : notification.type === 'info'
                            ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
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
                            {notification.type === 'success' ? '✅' : notification.type === 'info' ? 'ℹ️' : '❌'}
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

export default SignInPage;
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Paper,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateAccountTier, updateUserProfile } from './api';

// Account tier information
const tierInfo = {
  1: { 
    name: 'Basic', 
    features: ['Limited access', '5 transactions per day', 'No support'],
    price: 'Free'
  },
  2: { 
    name: 'Standard', 
    features: ['Standard speed access', '10 transactions per day', 'Simple in-app report support'],
    price: '10 coins/day'
  },
  3: { 
    name: 'Premium', 
    features: ['Full speed site access', '20 transactions per day', 'Advanced in-app support', 'Advanced analytics'],
    price: '$20 coins/day'
  },
  4: { 
    name: 'Gold', 
    features: ['Everything in Premium', '30 Daily transactions', 'Higher transaction limits', 'Email support', "Increased withdraw limits"],
    price: '$50 coins/day'
  },
  5: { 
    name: 'Platinum', 
    features: ['Everything in Gold', 'No transaction size limits', 'Expedited withdrawls', "No Max Balance", 'Priority support'],
    price: '$75 coins/day'
  },
  6: { 
    name: 'Diamond', 
    features: ['Everything in Platinum', 'No transaction count limits', "Advanced Rapid Support",'Special features'],
    price: '100 coins/day'
  },
  7: { 
    name: 'Ultimate', 
    features: ['Everything in Diamond', 'No transaction fees', 'No transaction limits', "Immediate withdrawals"],
    price: '200 coins/day'
  }
};

const UpgradeAccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTier = 1, nextTier = 2 } = location.state || {};
  
  const [step, setStep] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNextStep = () => {
    setStep(current => current + 1);
  };
  
  const handlePreviousStep = () => {
    setStep(current => current - 1);
  };
  
  const handleUpgrade = async () => {
    setProcessing(true);
    setError('');
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user profile with new tier
      await updateAccountTier({ accountTier: nextTier });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/account');
      }, 3000);
    } catch (err) {
      console.error('Error upgrading account:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  const validatePaymentDetails = () => {
    const { cardNumber, cardName, expiryDate, cvv } = paymentDetails;
    return cardNumber.length >= 16 && cardName.length > 0 && expiryDate.length > 0 && cvv.length >= 3;
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Compare Plans
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              display="block"
              sx={{ 
                mb: 2,
                textAlign: 'center',
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}
            >
              (Prices in Coins/Subject to change)
            </Typography>
            
            {/* Mobile: Stack cards vertically, Desktop: Side by side */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    height: { xs: 'auto', md: '100%' },
                    mb: { xs: 2, md: 0 }
                  }}
                >
                  <CardHeader 
                    title={`Current: ${tierInfo[currentTier].name}`} 
                    subheader={tierInfo[currentTier].price}
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      '& .MuiCardHeader-title': {
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      },
                      '& .MuiCardHeader-subheader': {
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      },
                      py: { xs: 1, sm: 2 }
                    }}
                  />
                  <CardContent sx={{ py: { xs: 1, sm: 2 } }}>
                    <List dense>
                      {tierInfo[currentTier].features.map((feature, index) => (
                        <ListItem 
                          key={`current-${index}`}
                          sx={{ py: { xs: 0.25, sm: 0.5 } }}
                        >
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    border: '2px solid #1976d2',
                    height: { xs: 'auto', md: '100%' }
                  }}
                >
                  <CardHeader 
                    title={`New: ${tierInfo[nextTier].name}`}
                    subheader={tierInfo[nextTier].price}
                    sx={{ 
                      backgroundColor: '#e3f2fd',
                      '& .MuiCardHeader-title': {
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      },
                      '& .MuiCardHeader-subheader': {
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      },
                      py: { xs: 1, sm: 2 }
                    }}
                  />
                  <CardContent sx={{ py: { xs: 1, sm: 2 } }}>
                    <List dense>
                      {tierInfo[nextTier].features.map((feature, index) => (
                        <ListItem 
                          key={`new-${index}`}
                          sx={{ py: { xs: 0.25, sm: 0.5 } }}
                        >
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions sx={{ p: { xs: 1, sm: 2 } }}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={handleNextStep}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.5 }
                      }}
                    >
                      Proceed to Payment
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Payment Details
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              paragraph
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              You will be charged {tierInfo[nextTier].price} for the {tierInfo[nextTier].name} tier.
            </Typography>
            
            <Grid container spacing={2}>
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between', 
                  gap: { xs: 2, sm: 0 },
                  mt: 2 
                }}>
                  <Button 
                    variant="outlined" 
                    onClick={handlePreviousStep}
                    disabled={processing}
                    sx={{ 
                      order: { xs: 2, sm: 1 },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleUpgrade}
                    disabled={processing}
                    startIcon={<CreditCardIcon />}
                    sx={{ 
                      order: { xs: 1, sm: 2 },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    {processing ? 'Processing...' : `Upgrade to ${tierInfo[nextTier].name}`}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}>
        <Paper sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
          <CheckIcon color="success" sx={{ fontSize: { xs: 40, sm: 60 }, mb: 2 }} />
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
          >
            Upgrade Successful!
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Your account has been upgraded to the {tierInfo[nextTier].name} tier.
            You will be redirected to your account page in a moment.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/account')}
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            Go to Account
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
   <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 1, sm: 4 }, 
        px: { xs: 1, sm: 3 },
        minHeight: '100vh'
      }}
    >
      <Paper sx={{ p: { xs: 2, sm: 4 } }}>
        <Box sx={{ mb: { xs: 2, sm: 4 } }}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2.125rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Upgrade Your Account
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Get more features and benefits with our premium tiers.
          </Typography>
        </Box>
        
        <Stepper 
          activeStep={step} 
          sx={{ 
            mb: { xs: 2, sm: 4 },
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }
          }}
        >
          <Step>
            <StepLabel>Compare Plans</StepLabel>
          </Step>
          <Step>
            <StepLabel>Payment</StepLabel>
          </Step>
        </Stepper>
        
        <Divider sx={{ mb: { xs: 2, sm: 4 } }} />
        
        {renderStepContent()}
      </Paper>
      
      {/* All Account Tiers - Mobile Optimized */}
      <Paper sx={{ p: { xs: 2, sm: 4 }, mt: { xs: 2, sm: 4 } }}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          All Account Tiers
        </Typography>
        
        {/* Mobile: Vertical stack, Desktop: Horizontal scroll */}
        <Box sx={{ 
          display: { xs: 'flex', sm: 'flex' },
          flexDirection: { xs: 'column', sm: 'row' },
          overflowX: { xs: 'visible', sm: 'auto' },
          py: 2, 
          gap: 2 
        }}>
          {Object.entries(tierInfo).map(([tierLevel, tier]) => {
            const tierNum = parseInt(tierLevel);
            const isCurrent = tierNum === currentTier;
            const isTarget = tierNum === nextTier;
            const isUpgrade = tierNum > currentTier;
            const isDowngrade = tierNum < currentTier;
            
            return (
              <Card 
                key={tierLevel} 
                sx={{ 
                  minWidth: { xs: '100%', sm: 200 },
                  maxWidth: { xs: '100%', sm: 250 },
                  border: isCurrent 
                    ? '2px solid #1976d2' 
                    : isTarget 
                      ? '2px solid #2e7d32' 
                      : '1px solid #e0e0e0',
                  backgroundColor: isCurrent 
                    ? '#e3f2fd' 
                    : isTarget 
                      ? '#e8f5e9' 
                      : 'white'
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2 } }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    flexWrap: 'wrap',
                    gap: 1,
                    mb: 1
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                      {tier.name}
                    </Typography>
                    {isCurrent && (
                      <Chip 
                        label="Current" 
                        size="small" 
                        color="primary"
                      />
                    )}
                    {isTarget && (
                      <Chip 
                        label="Target" 
                        size="small" 
                        color="success"
                      />
                    )}
                  </Box>
                  <Typography 
                    variant="subtitle1" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    {tier.price}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      height: { xs: 'auto', sm: 80 }, 
                      overflow: { xs: 'visible', sm: 'auto' },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    {/* Show all features on mobile, truncated on desktop */}
                    {window.innerWidth < 600 
                      ? tier.features.join(', ')
                      : tier.features.slice(0, 2).join(', ') + (tier.features.length > 2 ? '...' : '')
                    }
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: { xs: 1, sm: 1 } }}>
                  {isUpgrade && !isTarget && (
                    <Button 
                      size="small" 
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setStep(0);
                        navigate('/upgrade-account', { 
                          state: { currentTier: currentTier, nextTier: tierNum } 
                        });
                      }}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      Upgrade To
                    </Button>
                  )}
                  {isDowngrade && (
                    <Button 
                      size="small" 
                      fullWidth
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate('/downgrade-account', { 
                        state: { currentTier: currentTier, nextTier: tierNum } 
                      })}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      Downgrade To
                    </Button>
                  )}
                  {isCurrent && (
                    <Button 
                      size="small" 
                      fullWidth
                      disabled
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      Current Tier
                    </Button>
                  )}
                  {isTarget && (
                    <Button 
                      size="small" 
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={() => handleNextStep()}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      Select This
                    </Button>
                  )}
                </CardActions>
              </Card>
            );
          })}
        </Box>
      </Paper>
    </Container>
  );
};

export default UpgradeAccountPage;
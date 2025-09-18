import React, { useState } from 'react';
import {
  Typography,
  Button,
  Paper,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  TextField,
  Chip
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Close as CloseIcon,
  Warning as WarningIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateUserProfile } from './api';

// Account tier information
const tierInfo = {
  1: { 
    name: 'Basic', 
    features: ['Limited access', '5 entries per day', 'Standard support'],
    price: 'Free'
  },
  2: { 
    name: 'Standard', 
    features: ['Full access', '15 entries per day', 'Priority email support'],
    price: '$4.99/month'
  },
  3: { 
    name: 'Premium', 
    features: ['Full access', 'Unlimited entries', '24/7 support', 'Advanced analytics'],
    price: '$9.99/month'
  },
  4: { 
    name: 'Gold', 
    features: ['Everything in Premium', 'API access', 'Dedicated account manager'],
    price: '$29.99/month'
  },
  5: { 
    name: 'Platinum', 
    features: ['Everything in Gold', 'Custom integrations', 'Weekly strategy calls'],
    price: '$49.99/month'
  },
  6: { 
    name: 'Diamond', 
    features: ['Everything in Platinum', 'White label options', 'Enterprise solutions'],
    price: '$99.99/month'
  },
  7: { 
    name: 'Ultimate', 
    features: ['Everything in Diamond', 'Custom development', 'Board level reporting'],
    price: '$199.99/month'
  }
};

const DowngradeAccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTier = 2, nextTier = 1 } = location.state || {};
  
  const [step, setStep] = useState(0);
  const [confirmText, setConfirmText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const handleNextStep = () => {
    setStep(current => current + 1);
  };
  
  const handlePreviousStep = () => {
    setStep(current => current - 1);
  };
  
  const openConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };
  
  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  const handleDowngrade = async () => {
    setProcessing(true);
    setError('');
    closeConfirmDialog();
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user profile with new tier
      await updateAccountTier({ accountTier: nextTier });

      setSuccess(true);
      setTimeout(() => {
        navigate('/account');
      }, 3000);
    } catch (err) {
      console.error('Error downgrading account:', err);
      setError('Failed to downgrade account. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  // Find the features that will be lost by downgrading
  const getLostFeatures = () => {
    const currentFeatures = new Set(tierInfo[currentTier].features);
    const nextFeatures = new Set(tierInfo[nextTier].features);
    
    return [...currentFeatures].filter(feature => !nextFeatures.has(feature));
  };
  
  const lostFeatures = getLostFeatures();
  
  if (success) {
    return (
      <Container 
        maxWidth="sm" 
        sx={{ 
          py: { xs: 2, sm: 4 }, 
          px: { xs: 1, sm: 3 },
          minHeight: '100vh'
        }}
      >
        <Paper sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
          <CheckIcon 
            color="success" 
            sx={{ fontSize: { xs: 40, sm: 60 }, mb: 2 }} 
          />
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
          >
            Downgrade Successful!
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Your account has been downgraded to the {tierInfo[nextTier].name} tier.
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
            Downgrade Your Account
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Review what features you'll lose before downgrading.
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            display="block"
            sx={{ 
              mt: 1,
              textAlign: 'center',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}
          >
            (Prices in Coins/Subject to change)
          </Typography>
        </Box>
        
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} md={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: { xs: 'auto', md: '100%' },
                mb: { xs: 2, md: 0 }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                >
                  Current: {tierInfo[currentTier].name}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  {tierInfo[currentTier].price}
                </Typography>
                <Divider sx={{ my: { xs: 1, sm: 2 } }} />
                <List dense>
                  {tierInfo[currentTier].features.map((feature, index) => (
                    <ListItem 
                      key={`current-${index}`}
                      sx={{ py: { xs: 0.25, sm: 0.5 } }}
                    >
                      <ListItemIcon sx={{ minWidth: { xs: 24, sm: 36 } }}>
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
                height: { xs: 'auto', md: '100%' },
                border: '2px solid #ed6c02'
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                >
                  New: {tierInfo[nextTier].name}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  {tierInfo[nextTier].price}
                </Typography>
                <Divider sx={{ my: { xs: 1, sm: 2 } }} />
                <List dense>
                  {tierInfo[nextTier].features.map((feature, index) => (
                    <ListItem 
                      key={`next-${index}`}
                      sx={{ py: { xs: 0.25, sm: 0.5 } }}
                    >
                      <ListItemIcon sx={{ minWidth: { xs: 24, sm: 36 } }}>
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
        </Grid>
        
        {lostFeatures.length > 0 && (
          <Box sx={{ 
            mt: { xs: 2, sm: 4 }, 
            p: { xs: 1.5, sm: 2 }, 
            backgroundColor: '#fff3e0', 
            borderRadius: 1 
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }} 
              gutterBottom
            >
              <WarningIcon color="warning" />
              Features you'll lose
            </Typography>
            <List dense>
              {lostFeatures.map((feature, index) => (
                <ListItem 
                  key={`lost-${index}`}
                  sx={{ py: { xs: 0.25, sm: 0.5 } }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 24, sm: 36 } }}>
                    <CloseIcon color="error" fontSize="small" />
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
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: { xs: 2, sm: 4 } }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          gap: { xs: 2, sm: 0 },
          mt: { xs: 2, sm: 4 }
        }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/account')}
            sx={{ 
              order: { xs: 2, sm: 1 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="warning"
            onClick={openConfirmDialog}
            disabled={processing}
            startIcon={<ArrowDownwardIcon />}
            sx={{ 
              order: { xs: 1, sm: 2 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            {processing ? 'Processing...' : 'Confirm Downgrade'}
          </Button>
        </Box>
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
                      ? '2px solid #ed6c02' 
                      : '1px solid #e0e0e0',
                  backgroundColor: isCurrent 
                    ? '#e3f2fd' 
                    : isTarget 
                      ? '#fff3e0' 
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
                        color="warning"
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
                  {isUpgrade && (
                    <Button 
                      size="small" 
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate('/upgrade-account', { 
                        state: { currentTier: currentTier, nextTier: tierNum } 
                      })}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      Upgrade To
                    </Button>
                  )}
                  {isDowngrade && !isTarget && (
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
                      color="warning"
                      onClick={openConfirmDialog}
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
      
      {/* Confirmation Dialog - Mobile Optimized */}
      <Dialog
        open={confirmDialogOpen}
        onClose={closeConfirmDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 3 },
            width: { xs: 'calc(100% - 16px)', sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Confirm Downgrade
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
            Are you sure you want to downgrade from {tierInfo[currentTier].name} to {tierInfo[nextTier].name}?
            {lostFeatures.length > 0 && " You will lose access to some features."}
          </DialogContentText>
          <DialogContentText sx={{ 
            mt: 2, 
            fontWeight: 'bold',
            fontSize: { xs: '0.85rem', sm: '0.875rem' }
          }}>
            Type "DOWNGRADE" to confirm:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
          p: { xs: 2, sm: 1 }
        }}>
          <Button 
            onClick={closeConfirmDialog}
            sx={{ 
              order: { xs: 2, sm: 1 },
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDowngrade} 
            color="warning"
            variant="contained"
            disabled={confirmText !== "DOWNGRADE"}
            sx={{ 
              order: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            Downgrade Now
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DowngradeAccountPage;
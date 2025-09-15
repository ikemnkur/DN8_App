// src/components/NavBar.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Box,
  CssBaseline,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard,
  History,
  Send,
  AccountBalance,
  Search,
  Message,
  Share,
  AccountCircle,
  Settings as SettingsIcon,
  LockOutlined,
  BookmarkAdd,
  LogoutOutlined,
} from '@mui/icons-material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import CategoryIcon from '@mui/icons-material/Category';
import { fetchUserProfile } from './api';

const drawerWidth = 180;

// Custom hook to track window size and aspect ratio
const useIsMobilePortrait = () => {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth: width, innerHeight: height } = window;
      setIsMobilePortrait(height / width >= 16 / 10);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobilePortrait;
};

const NavBar = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userdata')) || {});
  const navigate = useNavigate();
  const location = useLocation();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const isMobilePortrait = useIsMobilePortrait();
  const [mobileNavHeight, setMobileNavHeight] = useState(0);
  const [mobileNavWidth, setMobileNavWidth] = useState(48);

  // Callback ref to measure mobile nav height
  const mobileNavRef = useCallback((node) => {
    if (node !== null) {
      setMobileNavHeight(node.offsetHeight);
    }
  }, []);

  const enterFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
    setIsFullScreen(true);
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullScreen(false);
  };

  const getAdsPath = () => {
    if (userData.advertising === "active") {
      return '/ads-homepage';
    } else {
      return '/ads-activate';
    }
  };

  const getMenuItems = () => [
    { text: 'Dashboard', icon: <Dashboard />, path: '/Dashboard' },
    { text: 'Your Wallet', icon: <AccountBalance />, path: '/wallet' },
    { text: 'Send Coins', icon: <Send />, path: '/send' },
    { text: 'Look for Users', icon: <Search />, path: '/search' },
    { text: 'Messages', icon: <Message />, path: '/messages' },
    { text: 'Transaction History', icon: <History />, path: '/transactions' },
    { text: 'Published Content', icon: <LockOutlined />, path: '/manage-content' },
    { text: 'Your Stuff', icon: <CategoryIcon />, path: '/your-stuff' },
    { text: 'Account', icon: <AccountCircle />, path: '/account' },
    { text: "Info", icon: <InfoIcon />, path: '/' },
    { text: "Help & FAQs", icon: <HelpIcon />, path: '/help' },
    { text: "Ads", icon: <BookmarkAdd />, path: getAdsPath() },
  ];

  const unlockPage = location.pathname.startsWith('/unlock');
  const subPage = location.pathname.startsWith('/sub');
  const previewPage = location.pathname.startsWith('/preview-ad');
  const hideNavBar = ['/login', "/help", '/register', '/', '/info', '/create-ad', "/ad-analytics", "/ad-help", '/ads', '/display-ad', '/preview-ad', '/preview-ad/ad/', '/preview/pending-ad', "/ads-service", "/test-ad", "/ads", "/ads-join", "/ads-login", "/preview/pending-ad"].includes(location.pathname);

  function refreshPage() {
    window.location.reload(false);
  }

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUserData = JSON.parse(localStorage.getItem('userdata')) || {};
      setUserData(updatedUserData);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (hideNavBar || unlockPage || subPage || previewPage) {
      return;
    }
    const loadDashboardData = async () => {
      try {
        const profile = await fetchUserProfile('NavBar');
        const updatedUserData = {
          ...profile,
          birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
          accountTier: profile.accountTier || 1,
          encryptionKey: profile.encryptionKey || '',
        };
        setUserData(updatedUserData);
        localStorage.setItem('userdata', JSON.stringify(updatedUserData));
        window.dispatchEvent(new Event('localStorageChange'));
      } catch (err) {
        console.log('Error: ', err);
        setTimeout(() => {
          navigate('/login');
          refreshPage();
        }, 250);
      }
    };
    loadDashboardData();
  }, [navigate, location.pathname, hideNavBar, unlockPage, subPage, previewPage]);

  if (hideNavBar || unlockPage || subPage || previewPage) {
    return children;
  }

  const menuItems = getMenuItems();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ...(isMobilePortrait && { display: 'none' }),
        }}
      >
        <Toolbar>
          {!isMobilePortrait && (
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={() => setOpen(!open)}
              edge="start"
              sx={{ mx: 0.5, p: 1, fontSize: 32 }}
              size="large"
            >
              {open ? <ChevronLeftIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
            </IconButton>
          )}
          <IconButton
            color="inherit"
            aria-label="toggle full screen"
            onClick={() => (isFullScreen ? exitFullScreen() : enterFullScreen())}
            edge="start"
            sx={{ mx: 1, p: 1, fontSize: 32 }}
            size="large"
          >
            {isFullScreen ? <FullscreenExitIcon fontSize="large" /> : <FullscreenIcon fontSize="large" />}
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, textAlign: 'center' }}
          >
            Clout Coin
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => navigate('/settings')}
            sx={{ mr: 2, p: 1.5, fontSize: 32 }}
            size="large"
          >
            <SettingsIcon fontSize="large" />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/account')}
            sx={{ mr: 2, p: 1.5, fontSize: 32 }}
            size="large"
          >
            <AccountCircle fontSize="large" />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/login')}
            sx={{ mr: 2, p: 1.5, fontSize: 32 }}
            size="large"
          >
            <LogoutOutlined fontSize="large" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      {!isMobilePortrait && (
        <Drawer
          variant="permanent"
          sx={{
            width: open ? drawerWidth : 0,
            flexShrink: 0,
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : 48,
              boxSizing: 'border-box',
              overflowX: 'hidden',
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              // top: 64,
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                //   <Tooltip
                //   title={open ? '' : item.text}
                //   placement="right"
                //   key={item.text}
                //   PopperProps={{
                //   modifiers: [
                //     {
                //     name: 'offset',
                //     options: {
                //       offset: [0, -4], // Remove vertical offset
                //     },
                //     },
                //   ],
                //   }}
                // >

                <ListItem
                  button
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    alignItems: 'center',
                    justifyContent: open ? 'center' : 'center', // center row when open too
                    px: 1,
                  }}
                >
                  <Tooltip
                    title={open ? '' : item.text}
                    placement="right"
                    key={item.text}
                    PopperProps={{
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            // progressively shift the tooltip up a bit each tip instance
                            offset: [ 8 + 4 * (menuItems.indexOf(item) + 1), 12],
                          },
                        },
                      ],
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: open ? 30 : 0,      // give the icon cell some width when open
                        maxHeight: 48,
                        mr: open ? 1 : 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // px: 0.5,
                      }}
                    >
                      {React.isValidElement(item.icon)
                        ? React.cloneElement(item.icon, {
                          sx: { fontSize: open ? 30 : 30 }, // <- size the actual icon
                        })
                        : item.icon}
                    </ListItemIcon>

                  </Tooltip>

                  <ListItemText
                    primary={open ? item.text : ''}
                    sx={{
                      opacity: open ? 1 : 0,
                      transition: 'opacity 150ms',
                      ml: open ? 0.5 : 0,
                    }}
                  />
                </ListItem>
                // </Tooltip>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobilePortrait && (
        <Paper
          ref={mobileNavRef}
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}
          elevation={3}
        >
          <List
            sx={{
              display: 'flex',
              flexDirection: 'row',
              p: 0,
              overflowX: 'auto',
              flexWrap: 'nowrap',
              justifyContent: 'space-around',
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,.1)',
                borderRadius: '8px',
              },
            }}
          >
            {menuItems.map((item) => (
              <Box
                key={item.text}
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 100,
                }}
              >
                <ListItem
                  button
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    p: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: 'center',
                      mb: 0.5,
                      '& .MuiSvgIcon-root': {
                        fontSize: '3rem',
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.65rem',
                      whiteSpace: 'nowrap',
                    }}
                    sx={{
                      m: 0,
                    }}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mb: isMobilePortrait ? `${mobileNavHeight}px` : 0,
          ml: (!isMobilePortrait && !open) ? `${mobileNavWidth}px` : 0,
        }}
      >
        {!isMobilePortrait && <Toolbar />}
        {children}
      </Box>
    </Box>
  );
};

export default NavBar;



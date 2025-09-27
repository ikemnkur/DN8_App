// Search4User.js (styled to match SendMoney/Dashboard)
import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  CircularProgress,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Box,
  Divider,
  InputAdornment,
  Chip,
  Grid,
} from '@mui/material';
import { Search as SearchIcon, FilterList, Favorite as FavoriteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { searchFavorites, searchUsers } from './api';

const Search4User = () => {
  // Main search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [error, setError] = useState(null);
  const [favoritesError, setFavoritesError] = useState(null);

  const [userData, setUserData] = useState(null);

  // Favorites state
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState('');
  const [favoritesSearchResults, setFavoritesSearchResults] = useState([]);
  const [favoriteUsers, setFavoriteUsers] = useState([]);
  const [isLoadingFavoritesList, setIsLoadingFavoritesList] = useState(true);

  const navigate = useNavigate();

  // Shared card style (soft, bordered)
   const cardSx = {
    p: { xs: 2, sm: 2.5 },
    backgroundColor: '#070707ff',
    border: '2px solid #f9f957ff',
    borderRadius: 2,
    boxShadow: 'none',
  };


  // Load user data and favorites on mount
  useEffect(() => {
    const loadUserDataAndFavorites = async () => {
      try {
        const tempdata = localStorage.getItem('userdata');
        if (tempdata) {
          const tempuserdata = JSON.parse(tempdata);
          setUserData(tempuserdata);
          await loadFavoriteUsers(tempuserdata);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setIsLoadingFavoritesList(false);
      }
    };
    loadUserDataAndFavorites();
  }, []);

  // Load a sample or real favorite users
  const loadFavoriteUsers = async (userDataParam = null) => {
    setIsLoadingFavoritesList(true);
    try {
      const currentUserData = userDataParam || userData;
      if (!currentUserData) {
        setFavoriteUsers([]);
        return;
      }

      const sampleFavorites = [
        {
          user_id: 'sdafdscvrwd56cd6cf-897c-4d96-822c-118adfgs9c8',
          username: 'userman',
          profilePic: 'https://mui.com/static/images/avatar/3.jpg',
          bio: 'Macho Money Maker'
        },
        {
          user_id: '4566cd6cf-897c-4d96-822c-118adfgdfc8',
          username: 'moneyman',
          profilePic: 'https://mui.com/static/images/avatar/4.jpg',
          bio: 'I am a super Rich Boy'
        },
        {
          user_id: '123ds435-897c-4d96-822c-118a4cc899c8',
          username: 'ikemnkur',
          profilePic: 'http://res.cloudinary.com/dabegwb2z/image/upload/v1735277794/profile_pics/dpoxiavtti1lbie40df4.jpg',
          bio: 'I keep making it rain'
        }
      ];

      const favoritesToSet =
        currentUserData.favorites && Array.isArray(currentUserData.favorites) && currentUserData.favorites.length > 0
          ? currentUserData.favorites
          : sampleFavorites;

      setFavoriteUsers(favoritesToSet);
    } catch (err) {
      console.error('Error loading favorite users:', err);
      setFavoriteUsers([]);
    } finally {
      setIsLoadingFavoritesList(false);
    }
  };

  // Main user search
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (searchTerm.length < 4) {
        setError('Enter at least 4 characters to search.');
        setSearchResults([]);
      } else {
        let results = await searchUsers(searchTerm);
        if (!Array.isArray(results)) results = [];
        const resultsWithAvatars = results.map((user) => ({
          ...user,
          avatar: user.avatar || `https://mui.com/static/images/avatar/${randomIntFromInterval(1, 5)}.jpg`,
        }));
        setSearchResults(resultsWithAvatars);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('An error occurred while searching. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Favorites search
  const handleFavoritesInputChange = (e) => setFavoritesSearchTerm(e.target.value);

  const handleFavoritesSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    setIsLoadingFavorites(true);
    setFavoritesError(null);

    try {
      if (favoritesSearchTerm.length < 4) {
        setFavoritesError('Enter at least 4 characters to search favorites.');
        setFavoritesSearchResults([]);
      } else {
        let results = await searchFavorites(favoritesSearchTerm);
        if (!Array.isArray(results)) results = [];
        const resultsWithAvatars = results.map((fav) => ({
          ...fav,
          avatar: fav.avatar || fav.profilePic || `https://mui.com/static/images/avatar/${randomIntFromInterval(1, 5)}.jpg`,
        }));
        setFavoritesSearchResults(resultsWithAvatars);
      }
    } catch (err) {
      console.error('Error searching favorites:', err);
      setFavoritesError('An error occurred while searching favorites. Please try again.');
      setFavoritesSearchResults([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  // Debounce favorites search
  useEffect(() => {
    if (!favoritesSearchTerm || favoritesSearchTerm.length < 4) {
      setFavoritesSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      handleFavoritesSearch();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [favoritesSearchTerm]);

  // Utils
  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function gotoUserProfile(user) {
    navigate(`/user/${user.username}`);
  }

  function gotofavProfile(fav) {
    navigate(`/user/${fav.username}`);
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: { xs: 1.5, sm: 2 } }}>
      {/* Gradient Header */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #e9f321ff 30%, #f6ba3aff 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5
          }}
        >
          Find People
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Search all users and manage your favorites
        </Typography>
      </Box>

      {/* Stack vertically instead of side by side */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Global User Search */}
        <Paper sx={cardSx}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Global Search
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Enter at least 4 characters to search by username
          </Typography>

          <form onSubmit={handleSearch}>
            <TextField
              label="Search all users by username"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : <SearchIcon />}
              sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Paper
            variant="outlined"
            sx={{ p: 1, maxHeight: { xs: 280, sm: 340 }, overflow: 'auto', backgroundColor: '#000000ff' }}
          >
            <List sx={{ py: 0 }}>
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <ListItem
                    key={user.id || user.username}
                    button
                    onClick={() => gotoUserProfile(user)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.profilePic || user.avatar} alt={user.username} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography sx={{ fontWeight: 600 }}>{user.username}</Typography>}
                      secondary={
                        user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : ''
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary={searchTerm ? 'No users found' : 'Search for users above'}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Paper>

        {/* Favorites */}
        <Paper sx={cardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Your Favorites
            </Typography>
            <FavoriteIcon color="error" fontSize="small" />
            <Chip
              label={`${favoriteUsers.length} favorites`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          </Box>

          {/* Search Favorites */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#000000ff' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Search Favorites
            </Typography>
            <TextField
              label="Search your favorites"
              fullWidth
              value={favoritesSearchTerm}
              onChange={handleFavoritesInputChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Enter at least 4 characters to search your favorites
            </Typography>

            {isLoadingFavorites && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
                <CircularProgress size={18} />
              </Box>
            )}
            {favoritesError && (
              <Typography color="error" sx={{ mt: 1 }}>
                {favoritesError}
              </Typography>
            )}

            {/* Favorites search results */}
            <Paper
              variant="outlined"
              sx={{ p: 1, mt: 2, maxHeight: 240, overflow: 'auto', backgroundColor: '#000000ff' }}
            >
              <List sx={{ py: 0 }}>
                {Array.isArray(favoritesSearchResults) && favoritesSearchResults.length > 0 ? (
                  favoritesSearchResults.map((fav) => (
                    <ListItem
                      key={fav.id || fav.user_id || fav.username}
                      button
                      onClick={() => gotofavProfile(fav)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={fav.profilePic || fav.avatar} alt={fav.username || 'Favorite'} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 600 }}>{fav.username || 'Unnamed Favorite'}</Typography>}
                        secondary={fav.firstName && fav.lastName ? `${fav.firstName} ${fav.lastName}` : ''}
                      />
                      <FavoriteIcon color="error" fontSize="small" />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary={
                        favoritesSearchTerm && favoritesSearchTerm.length >= 4
                          ? 'No favorites match your search'
                          : 'Enter at least 4 characters to search your favorites'
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Paper>

          {/* Favorite Users List */}
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#000000ff' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Favorite Users
            </Typography>

            {isLoadingFavoritesList ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List sx={{ py: 0, maxHeight: 300, overflow: 'hidden' }}>
                {favoriteUsers.length > 0 ? (
                  favoriteUsers.map((fav) => (
                    <ListItem
                      key={fav.user_id || fav.username}
                      button
                      onClick={() => gotofavProfile(fav)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={fav.profilePic} alt={fav.username} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 600 }}>{fav.username}</Typography>}
                        secondary={fav.bio || 'No bio available'}
                      />
                      <FavoriteIcon color="error" fontSize="small" />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No favorite users yet"
                      secondary="Users you favorite will appear here"
                    />
                  </ListItem>
                )}
              </List>
            )}
          </Paper>
        </Paper>
      </Box>
    </Box>
  );
};

export default Search4User;

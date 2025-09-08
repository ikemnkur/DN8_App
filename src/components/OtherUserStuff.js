// OtherUserStuff.js (restyled)
require('dotenv').config();
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Link as MuiLink,
  CircularProgress,
  Avatar,
  InputAdornment,
  Chip,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Visibility,
  Share as ShareIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import axios from 'axios';
import { useAuthCheck } from './useAuthCheck.js';
import Clipboard from './Clipboard.js';
import { fetchOtherUserProfile } from './api.js';

const API_URL = process.env.REACT_APP_API_SERVER_URL + '/api';

const siteURL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

const OtherUserStuff = () => {
  const navigate = useNavigate();
  useAuthCheck();

  const { user: otherUsername } = useParams();

  // Header/profile bits
  const [otherProfile, setOtherProfile] = useState(null);

  // Content
  const [contentList, setContentList] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [searchTermContent, setSearchTermContent] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Share dialog
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');

  // Legacy confirm (kept if you still call it elsewhere)
  const [openDialog, setOpenDialog] = useState(false);
  const [action, setAction] = useState('');

  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!otherUsername) {
        setIsLoading(false);
        setError('No username provided');
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        // Load their profile for avatar/display
        try {
          const p = await fetchOtherUserProfile(otherUsername);
          setOtherProfile(p || null);
        } catch {
          setOtherProfile(null);
        }

        // Load their public content
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${API_URL}/user-content/getOther/${otherUsername}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const rows = res.data || [];
        setContentList(rows);
        setFilteredContent(rows);
      } catch (err) {
        console.error('Failed to load content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [otherUsername]);

  const goToUserProfile = () => navigate(`/user/${otherUsername}`);

  const handleShare = (item) => {
    setShareLink(`${siteURL}/unlock/${item.reference_id}`);
    setOpenShareDialog(true);
  };

  const sortContent = (rows) => {
    const sorted = [...rows].sort((a, b) => {
      let av, bv;
      switch (sortBy) {
        case 'date':
          av = new Date(a.created_at);
          bv = new Date(b.created_at);
          break;
        case 'amount':
          av = parseFloat(a.cost);
          bv = parseFloat(b.cost);
          break;
        case 'username':
          av = String(a.host_username || '').toLowerCase();
          bv = String(b.host_username || '').toLowerCase();
          break;
        default:
          av = a.id;
          bv = b.id;
      }
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const contentToDisplay = sortContent(filteredContent);

  const handleSearchContent = (e) => {
    e?.preventDefault?.();
    const term = searchTermContent.toLowerCase();
    setFilteredContent(
      contentList.filter(
        (i) =>
          String(i.title || '').toLowerCase().includes(term) ||
          String(i.host_username || '').toLowerCase().includes(term) ||
          String(i.type || '').toLowerCase().includes(term) ||
          String(i.cost || '').includes(term)
      )
    );
  };

  const renderContentPreview = (content) => {
    if (!content) return null;
    let contentData;
    if (typeof content.content === 'object' && content.content !== null) {
      contentData = content.content.content || JSON.stringify(content.content);
    } else {
      contentData = content.content || content;
    }
    if (typeof contentData === 'object') contentData = JSON.stringify(contentData);

    switch (content.type) {
      case 'image':
        return (
          <Card sx={{ maxWidth: '100%', mb: 2 }}>
            <CardMedia component="img" height="300" image={String(contentData)} alt={content.title || 'Content image'} sx={{ objectFit: 'contain' }} />
          </Card>
        );
      case 'video':
        return (
          <Card sx={{ maxWidth: '100%', mb: 2 }}>
            <CardMedia component="video" height="300" src={String(contentData)} controls sx={{ objectFit: 'contain' }} />
          </Card>
        );
      case 'url':
        return (
          <Card sx={{ maxWidth: '100%', mb: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">URL Content:</Typography>
              <MuiLink href={String(contentData)} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all' }}>
                <Typography variant="body1">{String(contentData)}</Typography>
              </MuiLink>
            </CardContent>
          </Card>
        );
      case 'text':
      default:
        return (
          <Card sx={{ maxWidth: '100%', mb: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>Text Content:</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{String(contentData)}</Typography>
            </CardContent>
          </Card>
        );
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Typography color="error" sx={{ p: 2 }}>{error}</Typography>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Gradient Header with Avatar + View Profile */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Avatar
          src={otherProfile?.profilePic || otherProfile?.avatar}
          alt={otherUsername}
          sx={{
            width: 96,
            height: 96,
            mx: 'auto',
            mb: 1,
            border: '2px solid',
            borderColor: 'primary.light',
          }}
        />
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          {otherUsername}'s Stuff
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          View public/unlocked content from @{otherUsername}
        </Typography>
        <Button
          onClick={goToUserProfile}
          variant="contained"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          View Profile
        </Button>
      </Box>

      {/* Content Card */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          border: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {otherUsername}'s Content
          </Typography>
         
        </Box>

    {/* Controls */}
        <Box
          component="form"
          onSubmit={handleSearchContent}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center', mb: 2 }}
        >
          <TextField
            label="Search content"
            value={searchTermContent}
            onChange={(e) => setSearchTermContent(e.target.value)}
            size="small"
            sx={{ flex: { xs: '1 1 100%', md: '0 1 320px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon /></InputAdornment>
              ),
            }}
          />
          <Box >
            <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
              Search
            </Button>
          </Box>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small">
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="amount">Amount</MenuItem>
            <MenuItem value="username">Username</MenuItem>
          </Select>
          <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} size="small">
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
          <Chip
            label={`${contentToDisplay.length} item${contentToDisplay.length === 1 ? '' : 's'}`}
            variant="outlined"
            color="primary"
            sx={{ ml: 'auto' }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: { xs: 360, md: 480 }, overflowY: 'auto', borderRadius: 1 }}>
          <Table stickyHeader>
            <TableHead sx={{ '& .MuiTableCell-stickyHeader': { backgroundColor: (t) => t.palette.background.paper + ' !important', fontWeight: 600 } }}>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contentToDisplay.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.created_at?.slice(0, 10)}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>₡{item.cost}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Open">
                      <IconButton onClick={() => navigate(`/unlock/${item.reference_id}`)} size="small"><Visibility fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                      <IconButton onClick={() => handleShare(item)} size="small"><ShareIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {contentToDisplay.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">No content found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Share Dialog */}
      <Dialog
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle>Share this item</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <DialogContentText>Scan or copy the link below:</DialogContentText>
          {shareLink && (
            <>
              <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <QRCode value={shareLink} size={240} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <Clipboard Item={shareLink} />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* (Optional) Legacy confirm dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{action === 'reload' ? 'Reload Wallet' : 'Withdraw Funds'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {action === 'reload' ? 'reload your wallet' : 'withdraw funds'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button autoFocus>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default OtherUserStuff;

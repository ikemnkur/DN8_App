// YourStuff.js
require('dotenv').config();
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  CardMedia,
  Link,
  InputAdornment,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  EditNote as EditNoteIcon,
  Share as ShareIcon,
  Visibility,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  fetchUserContent,
  fetchUserSubscriptions,
  handleDeleteUserContent,
  fetchWalletData,
} from './api.js';
import Clipboard from './Clipboard.js';
import QRCode from 'qrcode.react';
import axios from 'axios';
import { useAuthCheck } from './useAuthCheck.js';

const API_URL = process.env.REACT_APP_API_SERVER_URL + '/api';

let siteURL = typeof window !== 'undefined'
  ? window.location.origin
  : process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

const YourStuff = () => {
  const navigate = useNavigate();
  useAuthCheck();

  const [searchTermContent, setSearchTermContent] = useState('');
  const [searchTermSub, setSearchTermSub] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [action, setAction] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewingContent, setViewingContent] = useState(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [content, subs] = await Promise.all([fetchUserContent(), fetchUserSubscriptions()]);
        setContentList(content || []);
        setFilteredContent(content || []);
        setSubscriptionList(subs || []);
        setFilteredSubs(subs || []);
      } catch (err) {
        console.error('Failed to load data', err);
        setError('Failed to load your content/subscriptions.');
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, []);

  const searchContent = () => {
    const term = searchTermContent.toLowerCase();
    setFilteredContent(
      contentList.filter(
        (i) =>
          String(i.title || '').toLowerCase().includes(term) ||
          String(i.host_username || '').toLowerCase().includes(term) ||
          String(i.type || '').toLowerCase().includes(term)
      )
    );
  };

  const searchSubs = () => {
    const term = searchTermSub.toLowerCase();
    setFilteredSubs(
      subscriptionList.filter(
        (s) =>
          String(s.title || '').toLowerCase().includes(term) ||
          String(s.host_username || '').toLowerCase().includes(term)
      )
    );
  };

  const handleSearchContent = (e) => {
    e?.preventDefault?.();
    searchContent();
  };

  const handleSearchSubs = (e) => {
    e?.preventDefault?.();
    searchSubs();
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
  const subsToDisplay = sortContent(filteredSubs);

  const handleViewContent = (item) => {
    setViewingContent(item);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingContent(null);
  };

  const handleDeleteFromView = async () => {
    if (!viewingContent) return;
    try {
      await handleDeleteUserContent(viewingContent.id);
      handleCloseViewDialog();
      // refresh
      const updated = contentList.filter((c) => c.id !== viewingContent.id);
      setContentList(updated);
      setFilteredContent(updated);
    } catch (err) {
      console.error('Failed to delete content from view:', err);
    }
  };

  const renderContentPreview = (content) => {
    if (!content) return null;

    // Extract safely
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
              <Link href={String(contentData)} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all' }}>
                <Typography variant="body1">{String(contentData)}</Typography>
              </Link>
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
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
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
          Your Stuff
        </Typography>
        <Typography variant="h6" color="text.secondary">
          View your unlocked content and subscriptions
        </Typography>
      </Box>

      {/* Unlocked Content */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, border: '1px solid #e9ecef', backgroundColor: '#f8f9fa', borderRadius: 2 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0 }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Your Unlocked Content</Typography>
       
        </Box>
        
          <Box
          component="form"
          onSubmit={handleSearchContent}
          sx={{
            position: 'relative',
            mb: 2,
            p: { xs: 0.5, sm: 1 }, // tiny padding so the top-right chip has some breathing room
          }}
        >
         

          {/* Row 1: Search input + Search button */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              alignItems: 'center',
            }}
          >
            <TextField
              label="Search content"
              value={searchTermContent}
              onChange={(e) => setSearchTermContent(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon /></InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ textTransform: 'none', flexShrink: 0 }}
            >
              Search
            </Button>
          </Box>

          {/* Row 2: Filters + Reset */}
          <Box
            sx={{
              mt: 1.5,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="small"
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="username">Username</MenuItem>
            </Select>

            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              size="small"
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
              {/* Chip pinned to the top-right */}
          <Chip
            label={`${contentToDisplay.length} item${contentToDisplay.length === 1 ? '' : 's'}`}
            variant="outlined"
            color="primary"
            sx={{ marginRight: "1%"}}
            // sx={{ position: 'absolute', top: 8, right: 8 }}
          />

            {/* <Button
              variant="text"
              sx={{ textTransform: 'none' }}
              onClick={() => { setSearchTermContent(''); setFilteredContent(contentList); }}
            >
              Reset
            </Button> */}
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: { xs: 360, md: 480 }, overflowY: 'auto', borderRadius: 1 }}>
          <Table stickyHeader>
            <TableHead sx={{ '& .MuiTableCell-stickyHeader': { backgroundColor: (t) => t.palette.background.paper + ' !important', fontWeight: 600 } }}>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Host User</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contentToDisplay.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.created_at.slice(0, 10)}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.host_username}</TableCell>
                  <TableCell>₡{item.cost}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="View">
                      <IconButton onClick={() => handleViewContent(item)} size="small"><Visibility fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                      <IconButton onClick={() => { setShareLink(`${siteURL}/unlock/${item.reference_id}`); setOpenShareDialog(true); }} size="small"><ShareIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteUserContent(item.id)} size="small"><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {contentToDisplay.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No content found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Subscriptions */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, border: '1px solid #e9ecef', backgroundColor: '#f8f9fa', borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Your Subscriptions</Typography>
        <Box
          component="form"
          onSubmit={handleSearchSubs}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 2 }}
        >
          <TextField
            label="Search subscriptions"
            value={searchTermSub}
            onChange={(e) => setSearchTermSub(e.target.value)}
            size="small"
            sx={{ flex: { xs: '1 1 100%', md: '0 1 320px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon /></InputAdornment>
              ),
            }}
          />
          <Chip label={`${subsToDisplay.length} subscription${subsToDisplay.length === 1 ? '' : 's'}`} variant="outlined" color="primary" />
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small">
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="amount">Amount</MenuItem>
            <MenuItem value="username">Username</MenuItem>
          </Select>
          <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} size="small">
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
          <Box sx={{ ml: 'auto' }}>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>Search</Button>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: { xs: 360, md: 480 }, overflowY: 'auto', borderRadius: 1 }}>
          <Table stickyHeader>
            <TableHead sx={{ '& .MuiTableCell-stickyHeader': { backgroundColor: (t) => t.palette.background.paper + ' !important', fontWeight: 600 } }}>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell align="center">Open</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subsToDisplay.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.title}</TableCell>
                  <TableCell>{s.host_username}</TableCell>
                  <TableCell>{s.created_at?.slice(0, 10)}</TableCell>
                  <TableCell>₡{s.cost}</TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" size="small" sx={{ textTransform: 'none' }} onClick={() => navigate(`/unlock/${s.reference_id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {subsToDisplay.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">No subscriptions found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Content Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>{viewingContent?.title}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>Preview</DialogContentText>
          {renderContentPreview(viewingContent)}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Host User:</Typography>
                <Typography variant="body1">{viewingContent?.host_username}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Cost:</Typography>
                <Typography variant="body1">₡{viewingContent?.cost}</Typography>
              </Box>
            </Box>
            {viewingContent?.description && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Description:</Typography>
                <Typography variant="body1">{viewingContent.description}</Typography>
              </Box>
            )}
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => { setShareLink(`${siteURL}/unlock/${viewingContent.reference_id}`); setOpenShareDialog(true); }} startIcon={<ShareIcon />}>
            Share
          </Button>
          <Button variant="outlined" color="error" onClick={handleDeleteFromView} startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)} PaperProps={{ sx: { borderRadius: 2, p: 1 } }}>
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

      {/* Legacy confirm dialog preserved if you still use action */}
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
        open={false}
        autoHideDuration={6000}
        onClose={() => { }}
        message=""
      />
    </Box>
  );
};

export default YourStuff;

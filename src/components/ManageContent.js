// ManageContent.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
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
  Snackbar,
  InputAdornment,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  EditNote as EditNoteIcon,
  Share as ShareIcon,
  SortByAlpha,
  SortTwoTone,
  Search as SearchIcon,
  Visibility,
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import Clipboard from './Clipboard.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const ManageContent = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [contentList, setContentList] = useState([]);
  const [filteredContentList, setFilteredContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [thisUser] = useState(JSON.parse(localStorage.getItem('userdata')));

  const [newContent, setNewContent] = useState({
    username: thisUser?.username,
    hostuser_id: thisUser?.id,
    title: '',
    cost: 1,
    description: '',
    content: '',
    type: 'url',
    reference_id: uuidv4(),
    id: 0,
    account_id: thisUser?.account_id,
  });

  const API_URL = process.env.REACT_APP_API_SERVER_URL + '/api';
  let siteURL = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

  const loadContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/public-content/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setContentList(data);
      setFilteredContentList(data);
    } catch (err) {
      console.error('Failed to fetch content:', err);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContent((prev) => ({
      ...prev,
      [name]: name === 'cost' ? parseInt(value) || 0 : value,
    }));
  };

  const searchContent = () => {
    const term = searchTerm.toLowerCase();
    const filtered = contentList.filter((item) =>
      String(item.host_username || '').toLowerCase().includes(term) ||
      String(item.cost || '').includes(searchTerm) ||
      String(item.title || '').toLowerCase().includes(term) ||
      String(item.created_at || '').toLowerCase().includes(term) ||
      String(item.description || '').toLowerCase().includes(term)
    );
    setFilteredContentList(filtered);
  };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    searchContent();
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/public-content/delete/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadContent();
    } catch (err) {
      console.error('Failed to delete content:', err);
      setSnackbarMessage('Failed to delete content.');
      setOpenSnackbar(true);
    }
  };

  const handleCreateContent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/public-content/create`, newContent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewContent({
        username: thisUser.username,
        hostuser_id: thisUser.id,
        title: '',
        cost: 1,
        description: '',
        content: '',
        type: 'url',
        reference_id: uuidv4(),
      });
      setOpenDialog(false);
      loadContent();
    } catch (err) {
      console.error('Failed to create content:', err);
      setSnackbarMessage('Failed to create content.');
      setOpenSnackbar(true);
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setNewContent({
      username: thisUser.username,
      hostuser_id: thisUser.id,
      title: item.title,
      cost: item.cost,
      description: item.description,
      content: item.content.content,
      type: item.type,
      reference_id: item.reference_id,
      id: item.id,
      account_id: thisUser.account_id,
    });
    setOpenDialog(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/public-content/edit`, newContent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage('Successfully updated content.');
      setNewContent({
        username: thisUser.username,
        hostuser_id: thisUser.id,
        title: '',
        cost: 1,
        description: '',
        content: '',
        type: 'url',
        reference_id: uuidv4(),
      });
      setEditing(false);
      setOpenDialog(false);
      loadContent();
    } catch (err) {
      console.error('Failed to update content');
      setSnackbarMessage('Failed to update content.');
      setOpenSnackbar(true);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setNewContent({
      username: thisUser.username,
      hostuser_id: thisUser.id,
      title: '',
      cost: 1,
      description: '',
      content: '',
      type: 'url',
      reference_id: uuidv4(),
    });
    setOpenDialog(false);
  };

  const handleShare = (item) => {
    setShareLink(`${siteURL}/unlock/${item.reference_id}`);
    setOpenShareDialog(true);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
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
          Manage Unlockable Content
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Create, search, sort, preview and share your content
        </Typography>
      </Box>

      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          border: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
        }}
      >
        {/* Controls */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'center',
            mb: 2,
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              label="Search content"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: { xs: '1 1 100%', md: '0 1 340px' } }}
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
              sx={{ textTransform: 'none', flexShrink: 0 }}
            >
              Search
            </Button>
            {/* <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
              Search
            </Button> */}
          </Box>


          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Chip
              label={`${filteredContentList.length} item${filteredContentList.length === 1 ? '' : 's'}`}
              variant="outlined"
              color="primary"
            />
            {/* <SortByAlpha fontSize="small" /> */}
            <Select value={sortBy} size="small" onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="cost">Cost</MenuItem>
              <MenuItem value="username">Username</MenuItem>
            </Select>

            {/* <SortTwoTone fontSize="small" /> */}
            <Select value={sortOrder} size="small" onChange={(e) => setSortOrder(e.target.value)}>
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>

            {/* move to the right most  */}


            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                sx={{ textTransform: 'none', ml: 'auto' }}
                onClick={() => {
                  setEditing(false);
                  setOpenDialog(true);
                }}
              >
                Create
              </Button>
              {/* <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
                Search
              </Button> */}
              <Button
                variant="outlined"
                sx={{ textTransform: 'none' }}
                onClick={() => {
                  setSearchTerm('');
                  setFilteredContentList(contentList);
                }}
              >
                Reset
              </Button>

            </Box>

          </Box>
        </Box>

        {/* Scrollable Table */}
        <TableContainer
          component={Paper}
          sx={{ maxHeight: { xs: 360, md: 500 }, overflowY: 'auto', borderRadius: 1 }}
        >
          <Table stickyHeader>
            <TableHead
              sx={{
                '& .MuiTableCell-stickyHeader': {
                  backgroundColor: (t) => t.palette.background.paper + ' !important',
                  fontWeight: 600,
                },
              }}
            >
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Price</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                filteredContentList.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.title}</TableCell>
                    <TableCell sx={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.description}
                    </TableCell>
                    <TableCell>{item.created_at.slice(0, 10)}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>₡{item.cost}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Preview">
                        <IconButton onClick={() => navigate(`/unlock/${item.reference_id}`)} size="small">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share">
                        <IconButton onClick={() => handleShare(item)} size="small">
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(item)} size="small">
                          <EditNoteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(item.id)} size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && filteredContentList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No content found.
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Content */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>{editing ? 'Edit Content' : 'Add New Content'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {editing ? 'Update your content details below.' : 'Fill in the details to add content.'}
          </DialogContentText>

          <Box component="form" onSubmit={editing ? handleSubmitEdit : handleCreateContent}>
            <TextField
              label="Title"
              name="title"
              value={newContent.title}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Price (₡)"
              name="cost"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              value={newContent.cost}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              name="description"
              value={newContent.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              label="Content"
              name="content"
              value={newContent.content}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              required
              helperText="Enter URL, text, or file path based on content type"
            />
            <Select
              name="type"
              value={newContent.type}
              onChange={handleInputChange}
              fullWidth
              sx={{ mt: 2 }}
            >
              <MenuItem value="url">URL</MenuItem>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="code">Code</MenuItem>
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="file">File</MenuItem>
            </Select>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
              {editing ? (
                <>
                  <Button onClick={cancelEdit} variant="outlined" color="inherit" sx={{ textTransform: 'none' }}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
                  Add New Content
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle>Share Content</DialogTitle>
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

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default ManageContent;

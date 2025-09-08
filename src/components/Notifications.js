// Notifications.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,
  Stack,
  Pagination,
} from '@mui/material';
import { Close, Snooze, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [snoozedNotifications, setSnoozedNotifications] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_SERVER_URL+'/api'; // Adjust this if your API URL is different

  // Fetch notifications from the backend API
  useEffect(() => {
    const fetchNotifications = async () => {
    // Check if notifications are already in localStorage
    const cachedNotifications = localStorage.getItem('CCC_notifications');
    if (cachedNotifications && cachedNotifications !== '[]') {
      // if time since the last notification is more than 24 hours || Date.now() - cachedNotifications[0].created_at > 86400000
      // Example of format: cachedNotifications[0].created_at = '2025-06-11T11:23:06.000Z'
      // Parse and set notifications from cache
      const parsedNotifications = JSON.parse(cachedNotifications);
      if (Date.now() - new Date(parsedNotifications[0].created_at) > 86400000) {
        // If cached data is older than 24 hours, fetch new data
        localStorage.removeItem('CCC_notifications');
      } else {
        setNotifications(parsedNotifications);
        return; // Skip fetching if cached data is available
      }
    }
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(API_URL+'/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem('CCC_notifications', JSON.stringify(response.data));
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setSnackbarMessage('Failed to load notifications.');
        setOpenSnackbar(true);
      }
    };

    fetchNotifications();
  }, []);

  // Handle Dismiss Notification
  const handleDismiss = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_URL+`/notifications/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      setSnackbarMessage('Notification dismissed');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setSnackbarMessage('Failed to dismiss notification.');
      setOpenSnackbar(true);
    }
  };

  // Handle Snooze Notification
  const handleSnooze = (id) => {
    const snoozedNotif = notifications.find((notif) => notif.id === id);
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    setSnoozedNotifications((prev) => [...prev, snoozedNotif]);

    setSnackbarMessage('Notification snoozed for 1 hour');
    setOpenSnackbar(true);

    // Show the notification again after 1 hour
    setTimeout(() => {
      setNotifications((prev) => [...prev, snoozedNotif]);
      setSnoozedNotifications((prev) =>
        prev.filter((notif) => notif.id !== id)
      );
    }, 3600000); // 1 hour in milliseconds
  };

  // Handle View Notification
  const handleView = (notification) => {
    // Navigate to the relevant page based on notification type
    switch (notification.type) {
      case 'money_received':
        navigate('/transactions');
        break;
      case 'balance_reloaded':
        navigate('/account');
        break;
      case 'item_unlocked':
        navigate('/items/unlocked');
        break;
      // Add cases for other notification types
      default:
        navigate('/');
    }
  };

   const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination values
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  
  // Get current page notifications
  const currentNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return notifications.slice(startIndex, endIndex);
  }, [notifications, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Reset to first page when notifications change
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [notifications.length, currentPage, totalPages]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Notifications
      </Typography>
      <Typography variant="body1" gutterBottom>
        You have {notifications.length} new notifications.
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Click on a notification to view details or take action.
      </Typography>
      
      {/* Notification List max 10 items per page*/}
      {notifications.length > 0 ? (
        <>
          <Paper>
            <List>
              {currentNotifications.map((notif) => (
                <ListItem key={notif.id} alignItems="flex-start">
                  <ListItemText
                    primary={notif.message}
                    secondary={new Date(notif.created_at).toLocaleString()}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="view"
                      onClick={() => handleView(notif)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="snooze"
                      onClick={() => handleSnooze(notif.id)}
                    >
                      <Snooze />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="dismiss"
                      onClick={() => handleDismiss(notif.id)}
                    >
                      <Close />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
          
          {/* Pagination - only show if more than 10 notifications */}
          {notifications.length > itemsPerPage && (
            <Stack spacing={2} alignItems="center" sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
              <Typography variant="body2" color="textSecondary">
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, notifications.length)} of {notifications.length} notifications
              </Typography>
            </Stack>
          )}
        </>
      ) : (
        <Typography variant="body1">No new notifications.</Typography>
      )}
      
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );

  // return (
  //   // /
  //   // Main container for notifications
  //   // /limit list to 10 items use pagination if more than 10
  //   <Box sx={{ mt: 4 }}>
  //     <Typography variant="h5" gutterBottom>
  //       Notifications
  //     </Typography>
  //     <Typography variant="body1" gutterBottom>
  //       You have {notifications.length} new notifications.
  //     </Typography>
  //     <Typography variant="body2" color="textSecondary" gutterBottom>
  //       Click on a notification to view details or take action.
  //     </Typography>
  //     {/* Notification List max 10 items per page*/}
  //     {notifications.length > 0 ? (
  //       <Paper>
  //         <List>
  //           {notifications.map((notif) => (
  //             <ListItem key={notif.id} alignItems="flex-start">
  //               <ListItemText
  //                 primary={notif.message}
  //                 secondary={new Date(notif.created_at).toLocaleString()}
  //               />
  //               <ListItemSecondaryAction>
  //                 <IconButton
  //                   edge="end"
  //                   aria-label="view"
  //                   onClick={() => handleView(notif)}
  //                 >
  //                   <Visibility />
  //                 </IconButton>
  //                 <IconButton
  //                   edge="end"
  //                   aria-label="snooze"
  //                   onClick={() => handleSnooze(notif.id)}
  //                 >
  //                   <Snooze />
  //                 </IconButton>
  //                 <IconButton
  //                   edge="end"
  //                   aria-label="dismiss"
  //                   onClick={() => handleDismiss(notif.id)}
  //                 >
  //                   <Close />
  //                 </IconButton>
  //               </ListItemSecondaryAction>
  //             </ListItem>
  //           ))}
  //         </List>
  //       </Paper>
  //     ) : (
  //       <Typography variant="body1">No new notifications.</Typography>
  //     )}

  //     <Snackbar
  //       anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  //       open={openSnackbar}
  //       autoHideDuration={3000}
  //       onClose={() => setOpenSnackbar(false)}
  //       message={snackbarMessage}
  //     />
  //   </Box>
  // );
};

export default Notifications;

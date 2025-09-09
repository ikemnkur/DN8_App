import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Paper, Box, Snackbar } from '@mui/material';
import QRCode from 'qrcode.react';


const ShareWallet = () => {
  const [username, setUsername] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [thisUser, setThisUser] = useState(JSON.parse(localStorage.getItem("userdata")))


  let siteURL = ""; //useBaseUrl();
  if (typeof window !== 'undefined') {
    siteURL = window.location.origin;
  } else {
    siteURL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';
  }


  useEffect(() => {
    // Mock fetching current user's username
    setUsername(thisUser.username);
  }, []);

  useEffect(() => {
    // setShareLink(`https://${siteURL}/send?recipient=${username}`);
    setShareLink(`${siteURL}/send?recipient=${username}`);
  }, [username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setOpenSnackbar(true);
  };

  return (
    <Box>
      {/* <Typography variant="h4" gutterBottom>Share Wallet</Typography> */}
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, }}>
          Share Your Wallet
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Share your wallet link so others can send you coins easily!
        </Typography>
        <Box sx={{ mb: 2 , pt:2}}>
          <QRCode value={shareLink} size={200} />
        </Box>
        <TextField
          fullWidth
          value={shareLink}
          InputProps={{
            readOnly: true,
          }}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleCopyLink}>
          Copy Link
        </Button>
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Share this link or QR code with others to receive payments quickly.
        </Typography>
      </Paper>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="Link copied to clipboard!"
      />
    </Box>
  );
};

export default ShareWallet;

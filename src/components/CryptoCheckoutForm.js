// Move these components to the top level of your file or into separate files
require('dotenv').config();
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
// import { stripePromise } from './path-to-stripe-promise'; // Ensure you import your stripePromise correctly
import { fetchUserProfile, walletCryptoReloadAction, validateCryptoTransaction, uploadTransactionScreenshot } from "./api";
import { loadStripe } from '@stripe/stripe-js';
import { PhotoCamera } from '@mui/icons-material';


require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

export const CryptoCheckoutForm = ({ setCoins }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const amount = query.get('amount') || 0;
  let ud = JSON.parse(localStorage.getItem("userdata"))

  // Add these state variables at the top with your other useState declarations
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState('');


  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    walletAddress: '',
    key: '',
    transactionId: '',
    time: ''
  });
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [currency, setCurrency] = useState('BTC'); // Default currency
  const [rate, setRate] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState(''); // For success messages

  // Map for cryptocurrency IDs used by CoinGecko API
  const currencyIdMap = {
    BTC: 'bitcoin',
    LTC: 'litecoin',
    SOL: 'solana',
    ETH: 'ethereum',
    XMR: 'monero',
  };

  // Map for wallet addresses
  const walletAddressMap = {
    BTC: 'my-bitcoin-wallet-address',
    LTC: 'my-litecoin-wallet-address',
    SOL: 'my-solana-wallet-address',
    ETH: 'my-ethereum-wallet-address',
    XMR: '44X8AgosuXFCuRmBoDRc66Vw1FeCaL6vRiKRqrmqXeJdeKAciYuyaJj7STZnHMg7x8icHJL6M1hzeAPqSh8NSC1GGC9bkCp',
  };

  // Fetch current crypto rates whenever currency changes
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const currencyId = currencyIdMap[currency];

        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${currencyId}&vs_currencies=usd`
        );
        const data = await response.json();
        setRate(data[currencyId].usd); // USD value of 1 unit of selected currency
      } catch (error) {
        console.error('Error fetching crypto rates:', error);
        setErrorMessage('Unable to fetch current rates. Please try again later.');
      }
    };
    setTimeout(() => {
      fetchRate();
    }, 500)

  }, [currency]);

  // Example function to upload file to backend:
  const uploadToBackend = async (file) => {
    const formData = new FormData();
    formData.append('media', file);

    try {
      // uploadMediaFiles should return the media link or an object with mediaLink property
      const response = await uploadTransactionScreenshot(formData);
      console.log('Transaction screenshot file uploaded:', response);

     // If your backend returns { mediaLink: "..." }
      if (response && response.url) {
        return response.url;
      }
      // If your backend returns { mediaLink: "..." }
      if (response && response.mediaLink) {
        return response.mediaLink;
      }
      // If your backend returns the link directly
      if (typeof response === 'string') {
        return response;
      }
      throw new Error('Upload failed or invalid response');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };


  // Replace the handleScreenshotUpload function with this enhanced version
  const handleScreenshotUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File type validation
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Please upload only PNG or JPG files.');
      setUploadedFile(null);
      setFilePreview(null);
      return;
    }

    // File size validation (optional - 5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setFileError('File size must be less than 5MB.');
      setUploadedFile(null);
      setFilePreview(null);
      return;
    }

    // Clear any previous errors
    setFileError('');
    setUploadedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload logic (if you want to upload immediately)
    const formData = new FormData();
    formData.append('screenshot', file);
    formData.append('username', ud.username);
    formData.append('userId', ud.user_id || ud.id);
    formData.append('time', new Date().toISOString().split('T')[1]);
    formData.append('date', new Date().toISOString());

    try {
      let mediaLink;

      mediaLink = await uploadToBackend(file); // server returns { mediaLink }
      formData.append('mediaLink', mediaLink);

      setMessage('Screenshot uploaded successfully!');

    } catch (error) {
      console.error('API - Error uploading screenshot:', error);
      setFileError('An error occurred while uploading the image.');
    }
  };

  // Function to remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
    setFileError('');
    // Reset the file input
    const fileInput = document.getElementById('transaction-screenshot-upload');
    if (fileInput) fileInput.value = '';
  };

  // Calculate the amount in USD and crypto
  const dollarValueOfCoins = amount / 1000; // Assuming 1000 coins = $1
  const cryptoAmount = rate ? (dollarValueOfCoins / rate).toFixed(8) : '0.00000000'; // Amount of crypto to send

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!userDetails.name || !userDetails.email || !userDetails.walletAddress) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    // Send order details to backend
    try {

      let data = {
        username: ud.username,
        userId: ud.user_id,
        name: userDetails.name,
        email: userDetails.email,
        walletAddress: userDetails.walletAddress,
        key: userDetails.key,
        transactionId: userDetails.transactionId,
        currency: currency,
        amount: amount,
        cryptoAmount: cryptoAmount,
        date: new Date(),
        session_id: uuidv4()
      }

      const response = await validateCryptoTransaction(data);

      console.log("Response: ", response)

      if (response.ok) {
        setOrderSubmitted(true);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to submit order.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      if (error.message.includes("last 3 hours")) {
        setErrorMessage(error.message);
      }
      setErrorMessage('An error occurred. Please try again.');
      alert(error.message)
    }
  };

  const handleCancelOrder = () => {
    // Navigate back to dashboard or previous page
    navigate('/dashboard'); // Adjust the path as needed
  };

  const handleCopyAddress = () => {
    const walletAddress = walletAddressMap[currency] || 'YOUR_WALLET_ADDRESS_HERE';
    navigator.clipboard
      .writeText(walletAddress)
      .then(() => {
        setMessage('Wallet address copied to clipboard!');
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
        setErrorMessage('Failed to copy address.');
      });
  };



  const walletAddress = walletAddressMap[currency] || 'YOUR_WALLET_ADDRESS_HERE';

  if (orderSubmitted) {
    return (
      <div id="checkout" style={styles.container} backgroundColor="#e6ffed" borderRadius="8px" padding="20px">
        <h2>Order Logged!</h2>
        <p>
          Please make sure that you send <strong>{cryptoAmount} {currency}</strong> to the following wallet address:
        </p>
        <div style={styles.walletAddressContainer}>
          <p style={styles.walletAddress}>{walletAddress}</p>
          <button style={styles.button} onClick={handleCopyAddress}>
            Copy Address
          </button>
        </div>
        {message && <p style={styles.successMessage}>{message}</p>}
        {/* <p>
            After sending the payment, please provide the transaction ID so we can verify your payment.
          </p> */}
        <p>
          You will receive your coins once the transaction is confirmed.
          You check back on this order in a few hours.
        </p>
        <div style={{ alignItems: "center" }}>

        </div>
        <button style={styles.button} onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
        <button style={styles.button} onClick={() => navigate('/transactions')}>
          See orders status
        </button>
      </div>
    );
  }

  return (
    <div id="checkout" style={styles.container}>
      <div style={styles.header}>
        <h1>You are buying: {parseInt(amount).toLocaleString()} Coins</h1>
      </div>

      {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
      {message && <p style={styles.successMessage}>{message}</p>}
      <div style={styles.walletInfo}>
        <p>
          Please send <strong>{cryptoAmount} {currency}</strong> to the following wallet address:
        </p>
        <div style={styles.walletAddressContainer}>
          <p style={styles.walletAddress}>{walletAddress}</p>
          <button style={styles.button} onClick={handleCopyAddress}>
            Copy Address
          </button>
        </div>
        {message && <p style={styles.successMessage}>{message}</p>}
      </div>
      <br></br>
      <form onSubmit={handleOrderSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <p>
            After sending <strong>{cryptoAmount} {currency}</strong> to the following wallet address: {walletAddress}
            <br></br>
            Fill out the form below to log your order.
          </p>
          <label>
            Name:<span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={userDetails.name}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>
            Email:<span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={userDetails.email}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>
            Your Wallet Address:<span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="walletAddress"
            value={userDetails.walletAddress}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>



        <div style={styles.formGroup}>
          <label>Date:</label>
          <br></br>
          <input
            // fullWidth
            // margin="normal"
            name="birthDate"
            label="Birth Date"
            type="date"
            // disabled={isUpdating}
            // value={userData.birthDate}
            // onChange={handleInputChange}
            // InputLabelProps={{ shrink: true }} 
            style={styles.input}
            required
          />
          <small>Enter the date of transaction</small>
        </div>
        <div style={styles.formGroup}>
          <label>Time:</label>
          <input
            type="text"
            name="time"         // Change from "Time" to "time"
            value={userDetails.time}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
          <small>For reference, please format like (HH:MM + AM/PM), e.g., 12:15 PM</small>
          {/* <br></br> */}
          <button type="button" style={{ float: "right", margin: 2, padding: 2 }} onClick={() => {
            const currentTime = new Date();
            let hours = currentTime.getHours();
            const minutes = currentTime.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const strTime = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + ampm;
            setUserDetails((prev) => ({
              ...prev,
              time: strTime,
            }));
          }}>
            Get Current Time
          </button>

        </div>

        <div style={styles.formGroup}>
          <label>Transaction ID:</label>
          <input
            type="text"
            name="transactionId"
            value={userDetails.transactionId}
            onChange={handleInputChange}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Link to Transaction on Block Explorer:</label>
          <input
            type="text"
            name="blockExplorerLink"
            value={userDetails.blockExplorerLink}
            onChange={handleInputChange}
            style={styles.input}
          />
        </div>


        <div style={styles.formGroup}>
          <label>
            Transaction KEY (if any):
          </label>
          <input
            type="text"
            name="key"
            value={userDetails.key}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
          <small>For proof of payment</small>
        </div>

        <div style={styles.formGroup}>
          <label>Cryptocurrency:</label>
          <select
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={styles.select}
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="LTC">Litecoin (LTC)</option>
            <option value="SOL">Solana (SOL)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="XMR">Monero (XMR)</option>
          </select>
        </div>

        <div style={styles.rateInfo}>
          <p>
            Amount to Send: <strong>{cryptoAmount} {currency}</strong>
          </p>
          <p>
            Rate: 1 {currency} = ${rate} USD ~ {(1000 * rate).toLocaleString()} Coins (Max purchase is 100,000)
          </p>
        </div>

        {/* // Replace the upload section in your JSX with this enhanced version: */}
        <div style={styles.uploadSection}>
          <label style={styles.uploadLabel}>
            Payment Screenshot (Optional):
          </label>

          {/* Upload Button */}
          <div style={styles.uploadButtonContainer}>
            <input
              accept=".png,.jpg,.jpeg"
              style={{ display: 'none' }}
              id="transaction-screenshot-upload"
              type="file"
              onChange={handleScreenshotUpload}
            />
            <label htmlFor="transaction-screenshot-upload">
              <button
                type="button"
                style={styles.uploadButton}
                onClick={() => document.getElementById('transaction-screenshot-upload').click()}
              >
                <PhotoCamera style={{ marginRight: '8px', fontSize: '20px' }} />
                {uploadedFile ? 'Change Screenshot' : 'Upload Screenshot'}
              </button>
            </label>
          </div>

          {/* Error Message */}
          {fileError && (
            <div style={styles.fileError}>
              <span>⚠️</span> {fileError}
            </div>
          )}

          {/* File Preview and Info */}
          {uploadedFile && (
            <div style={styles.filePreviewContainer}>
              {/* Preview Image */}
              <div style={styles.previewSection}>
                <img
                  src={filePreview}
                  alt="Payment screenshot preview"
                  style={styles.previewImage}
                />
              </div>

              {/* File Info */}
              <div style={styles.fileInfoSection}>
                <div style={styles.fileInfo}>
                  <div style={styles.fileName}>
                    <span style={styles.fileIcon}>📎</span>
                    <span>{uploadedFile.name}</span>
                  </div>
                  <div style={styles.fileSize}>
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </div>
                  <div style={styles.fileType}>
                    {uploadedFile.type.split('/')[1].toUpperCase()}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  style={styles.removeButton}
                >
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          )}

          {/* Upload Instructions */}
          <div style={styles.uploadInstructions}>
            <small>
              📸 Upload a screenshot of your payment confirmation (PNG or JPG only, max 5MB)
            </small>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button style={styles.button} type="submit">
            Log Your Order
          </button>
          <button style={styles.cancel_button} type="button" onClick={handleCancelOrder}>
            Cancel Order
          </button>
        </div>
      </form>


    </div>
  );
};

// Styles object
const styles = {
  container: {
    maxWidth: '600px',
    margin: 'auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  form: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '5px',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    marginTop: '5px',
    borderRadius: '3px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    marginTop: '5px',
    borderRadius: '3px',
    border: '1px solid #ccc',
    fontSize: '16px',
    backgroundColor: '#fff',
  },
  required: {
    color: 'red',
  },
  rateInfo: {
    marginTop: '20px',
    marginBottom: '20px',
    backgroundColor: '#e0f7fa',
    padding: '15px',
    borderRadius: '5px',
  },
  buttonGroup: {
    textAlign: 'center',
  },
  button: {
    padding: '10px 20px',
    margin: '5px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  cancel_button: {
    padding: '10px 20px',
    margin: '5px',
    backgroundColor: '#F01b2f',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  walletInfo: {
    backgroundColor: '#fff8e1',
    padding: '15px',
    borderRadius: '5px',
  },
  walletAddressContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
    marginBottom: '10px',
  },
  walletAddress: {
    flexGrow: 1,
    fontSize: '16px',
    wordBreak: 'break-all',
  },
  errorMessage: {
    color: 'red',
    marginBottom: '20px',
  },
  successMessage: {
    color: 'green',
    marginBottom: '20px',
  },
  uploadSection: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '2px dashed #dee2e6',
  },

  uploadLabel: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#495057',
  },

  uploadButtonContainer: {
    textAlign: 'center',
    marginBottom: '15px',
  },

  uploadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
  },

  fileError: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px',
  },

  filePreviewContainer: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #dee2e6',
    marginBottom: '10px',
  },

  previewSection: {
    flexShrink: 0,
  },

  previewImage: {
    width: '128px',
    height: '128px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '2px solid #dee2e6',
  },

  fileInfoSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  fileInfo: {
    flex: 1,
  },

  fileName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    color: '#495057',
    marginBottom: '8px',
    fontSize: '14px',
    wordBreak: 'break-word',
  },

  fileIcon: {
    fontSize: '16px',
  },

  fileSize: {
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '4px',
  },

  fileType: {
    display: 'inline-block',
    padding: '2px 8px',
    backgroundColor: '#e9ecef',
    color: '#495057',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600',
  },

  removeButton: {
    padding: '8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    height: 'fit-content',
  },

  uploadInstructions: {
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '12px',
    fontStyle: 'italic',
  },
};

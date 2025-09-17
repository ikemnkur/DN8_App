require('dotenv').config();
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logCashappTransaction } from "./api";
import { loadStripe } from '@stripe/stripe-js';
const { v4: uuidv4 } = require('uuid');

import { PhotoCamera } from '@mui/icons-material';

// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const CashappCheckoutForm = ({ setCoins }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const amount = query.get('amount') || 0;
  let ud = JSON.parse(localStorage.getItem("userdata")) || {};

  // Add these state variables at the top with your other useState declarations
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState('');


  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    cashappTag: '',
    key: '',
    transactionId: '',
    time: '',
    date: ''
  });
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [currency, setCurrency] = useState('USD'); // Default currency
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');

  // Calculate the amount in USD based on user assumption (e.g., 1000 coins = $1)
  const cashappAmount = amount / 1000;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
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


  // Example function to upload file to backend:
  const uploadToBackend = async (file) => {
    const formData = new FormData();
    formData.append('media', file);

    try {
      // uploadMediaFiles should return the media link or an object with mediaLink property
      const response = await uploadTransactionScreenshot(formData);
      console.log('Ad Media file uploaded:', response);

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

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!userDetails.name || !userDetails.email || !userDetails.cashappTag) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    try {
      // Data payload for backend
      const data = {
        username: ud.username,
        userId: ud.user_id,
        name: userDetails.name,
        email: userDetails.email,
        cashappTag: userDetails.cashappTag,
        key: userDetails.key,
        transactionId: userDetails.transactionId, // You might rename this field if it's actually an amount
        currency: currency,
        amount: amount,
        cashappAmount: cashappAmount,
        date: userDetails.date || new Date().toISOString().split('T')[0],
        time: userDetails.time,
        session_id: uuidv4()
      };

      const response = await logCashappTransaction(data);
      console.log("Response: ", response);

      if (response.ok) {
        setOrderSubmitted(true);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to submit order.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleCancelOrder = () => {
    navigate('/dashboard'); // or another path as needed
  };

  const handleCopyAddress = () => {
    const cashappTagStatic = '$CloutCoinPay';
    navigator.clipboard
      .writeText(cashappTagStatic)
      .then(() => {
        setMessage('Cash Tag copied to clipboard!');
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((err) => {
        console.error('Could not copy Cashapp tag: ', err);
        setErrorMessage('Failed to copy address.');
      });
  };

  const cashappTagStatic = '$CloutCoinPay';

  if (orderSubmitted) {
    return (
      <div id="checkout" style={styles.container}>
        <h2>Order Logged!</h2>
        <h2>
          Step 3: Confirm that you have sent the payment, then wait for its confirmation by the system.
        </h2>
        <p>
          Please confirm you have sent <strong>{cashappAmount} {currency}</strong> to the following CashApp Tag:
        </p>
        <div style={styles.cashappTagContainer}>
          <p style={styles.cashappTag}>{cashappTagStatic}</p>
          <button style={styles.button} onClick={handleCopyAddress}>
            Copy Cashapp Tag
          </button>
        </div>
        {message && <p style={styles.successMessage}>{message}</p>}
        <p>
          You will receive your coins once the cashapp payment transaction is confirmed.
        </p>
      </div>
    );
  }

  return (
    <div id="checkout" style={styles.container}>
      <div style={styles.header}>
        <h1>You are buying: {parseInt(amount).toLocaleString()} Coins</h1>
      </div>

      <h2>Step 1: Send money to the CashApp account below:</h2>

      {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
      {message && <p style={styles.successMessage}>{message}</p>}

      <div style={styles.walletInfo}>
        <p>
          Please send <strong>{cashappAmount} {currency}</strong> to the following CashApp account:
        </p>
        <div style={styles.cashappTagContainer}>
          <img width="256px" src="./public/CashappQR.jpg" alt="CashApp QR" />
        </div>
        <div style={styles.cashappTagContainer}>
          <p style={styles.cashappTag}>{cashappTagStatic}</p>
          <button style={styles.button} onClick={handleCopyAddress}>
            Copy CashApp Tag
          </button>
        </div>
      </div>

      <h2>Step 2: Log the details of your order in this form below:</h2>

      <form onSubmit={handleOrderSubmit} style={styles.form}>
        <div style={styles.formGroup}>
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
            Your CashApp User Tag/Name:<span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="cashappTag"
            value={userDetails.cashappTag}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Amount Sent ($USD):</label>
          <input
            type="text"
            name="transactionId"
            placeholder="e.g. 10.00"
            value={userDetails.transactionId}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Date of Payment:</label>
          <input
            type="date"
            name="date"
            value={userDetails.date}
            onChange={handleInputChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label>Time of Payment (HH:MM AM/PM):</label>
          <input
            type="text"
            name="time"
            placeholder="e.g. 09:30 AM"
            value={userDetails.time}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
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
  required: {
    color: 'red',
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
    marginBottom: '20px',
  },
  cashappTagContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
    marginBottom: '10px',
  },
  cashappTag: {
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



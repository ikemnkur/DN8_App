import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Avatar,
  Stack,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  Visibility as EyeIcon,
  Settings as ZapIcon,
  EmojiEvents as AwardIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import { createAdroute, updateAdroute, uploadMediaFiles } from '../components/api'; // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';

// Lucide React icons  
import { Target } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const { v4: uuidv4 } = require('uuid');

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
}));

const GradientHeader = styled(Box)(({ theme, bgcolor }) => ({
  background: bgcolor || 'linear-gradient(135deg, #1976d2, #42a5f5)',
  color: 'white',
  padding: theme.spacing(2, 3),
  borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
  margin: theme.spacing(-3, -3, 2, -3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const UploadZone = styled(Box)(({ theme, isDragOver, hasError }) => ({
  border: `2px dashed ${hasError ? theme.palette.error.main : isDragOver ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: hasError ? theme.palette.error.light : isDragOver ? theme.palette.primary.light : theme.palette.grey[50],
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
  },
}));

const FormatCard = styled(Card)(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  backgroundColor: selected ? theme.palette.primary.light : 'white',
  transform: selected ? 'scale(1.02)' : 'scale(1)',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[4],
  },
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
  border: '1px solid rgba(0, 0, 0, 0.08)',
}));

// Convert a File to a data URL for preview/localStorage
const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);   // e.g. "data:image/png;base64,...."
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Get auth token from localStorage if not provided as prop
const token = localStorage.getItem('token');
const authToken = localStorage.getItem('authToken') || token; // Use the token from localStorage if authToken prop is not provided
// console.log('Auth Token:', authToken);
// console.log('Token:', token);



const CreateAdPage = ({ onSave, editingAd = null, authToken }) => {
  const [ad_uuid, setAD_uuid] = useState(uuidv4());
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    ad_uuid: ad_uuid,
    title: '',
    description: '',
    link: '',
    format: 'regular',
    mediaFile: null,         // File kept in memory until submit
    mediaFileLink: "",       // Filled *after* we upload on submit
    mediaDataUrl: '',        // Data URL for preview tab
    mediaMimeType: '',       // Optional, handy for preview
    mediaName: '',           // Optional
    budget: 2000,
    reward: 0,
    frequency: 'moderate',
    quiz: [
      { question: '', type: 'multiple', options: ['', '', '', ''], correct: 0, answer: '' }
    ]
  });

  const navigate = useNavigate();

  // Remove direct usage of @google-cloud/storage in React.
  // Instead, send the file to your backend API, which will handle uploading to Google Cloud Storage.
  // Example: Use fetch or axios to POST the file to your backend endpoint.

  // Example function to upload file to backend:
  const uploadToBackend = async (file) => {
    const formData = new FormData();
    formData.append('media', file);

    try {
      // uploadMediaFiles should return the media link or an object with mediaLink property
      const response = await uploadMediaFiles(formData);
      console.log('Ad Media file uploaded:', response);

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


  useEffect(() => {
    if (editingAd) {
      setFormData({
        ad_uuid: ad_uuid || "",
        title: editingAd.title || '',
        description: editingAd.description || '',
        link: editingAd.link || '',
        format: editingAd.format || 'regular',
        mediaFile: null,
        budget: editingAd.budget || 2000,
        reward: editingAd.reward || 0,
        frequency: editingAd.frequency || 'moderate',
        quiz: editingAd.quiz || [
          { question: '', type: 'multiple', options: ['', '', '', ''], correct: 0, answer: '' }
        ]
      });
    }
  }, [editingAd]);

  const formatOptions = [
    { value: 'regular', label: 'Regular', icon: '📄', description: 'Standard ad format' },
    { value: 'banner', label: 'Banner', icon: '🏷️', description: 'Wide banner display' },
    { value: 'popup', label: 'Popup', icon: '⬆️', description: 'Popup overlay' },
    { value: 'modal', label: 'Modal', icon: '🖼️', description: 'Modal dialog' },
    { value: 'video', label: 'Video', icon: '🎥', description: 'Video content' },
    { value: 'audio', label: 'Audio', icon: '🎵', description: 'Audio content' }
  ];

  const frequencyOptions = [
    { value: 'low', label: 'Low', icon: '🐌', description: 'Shown rarely' },
    { value: 'light', label: 'Light', icon: '🚶', description: 'Shown occasionally' },
    { value: 'moderate', label: 'Moderate', icon: '🚀', description: 'Balanced frequency' },
    { value: 'high', label: 'High', icon: '⚡', description: 'Shown frequently' },
    { value: 'aggressive', label: 'Aggressive', icon: '🔥', description: 'Maximum exposure' }
  ];

  // API Base URL - adjust this to match your backend URL
  // const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const API_BASE_URL = process.env.REACT_APP_API_SERVER_URL || 'http://localhost:5001';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleQuizChange = (index, field, value) => {
    const newQuiz = [...formData.quiz];
    newQuiz[index] = { ...newQuiz[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      quiz: newQuiz
    }));
  };

  const handleQuizOptionChange = (quizIndex, optionIndex, value) => {
    const newQuiz = [...formData.quiz];
    newQuiz[quizIndex].options[optionIndex] = value;
    setFormData(prev => ({
      ...prev,
      quiz: newQuiz
    }));
  };

  const addQuizQuestion = () => {
    setFormData(prev => ({
      ...prev,
      quiz: [
        ...prev.quiz,
        { question: '', type: 'multiple', options: ['', '', '', ''], correct: 0, answer: '' }
      ]
    }));
  };

  const removeQuizQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      quiz: prev.quiz.filter((_, i) => i !== index)
    }));
  };

  // const handleFileUpload = async (e) => {
  //   const file = e.target.files[0];
  //   processFile(file);

  // };

  // const handleFileDrop = (e) => {
  //   e.preventDefault();
  //   setDragOver(false);
  //   const file = e.dataTransfer.files[0];
  //   processFile(file);
  // };

  // const processFile = async (file) => {
  //   if (file) {
  //     const maxSize = formData.format === 'video' ? 2.5 * 1024 * 1024 : 2 * 1024 * 1024;
  //     if (file.size > maxSize) {
  //       setErrors(prev => ({
  //         ...prev,
  //         mediaFile: `File size must be less than ${formData.format === 'video' ? '2.5MB' : '2MB'}`
  //       }));
  //       return;
  //     }

  //     let link2upload = await uploadToBackend(file);
  //     console.log("Uploaded File Link: ", link2upload);

  //     setFormData(prev => ({
  //       ...prev,
  //       mediaFileLink: link2upload
  //     }));
  //     setFormData(prev => ({
  //       ...prev,
  //       mediaFile: file
  //     }));
  //     setErrors(prev => ({
  //       ...prev,
  //       mediaFile: ''
  //     }));
  //   }
  // };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    await processFile(file);
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    await processFile(file);
  };

  // NOTE: no server upload here anymore. Only validate + prepare preview/localStorage.
  const processFile = async (file) => {
    if (!file) return;

    // Size limits (same as before)
    const maxSize = formData.format === 'video' ? 2.5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        mediaFile: `File size must be less than ${formData.format === 'video' ? '2.5MB' : '2MB'}`
      }));
      return;
    }

    try {
      // Prepare preview data URL (safe to put in localStorage; your limits are small)
      const dataUrl = await fileToDataURL(file);

      setFormData((prev) => ({
        ...prev,
        mediaFile: file,
        mediaFileLink: '',        // Clear any prior server link
        mediaDataUrl: dataUrl,    // For preview tab
        mediaMimeType: file.type || '',
        mediaName: file.name || ''
      }));

      setErrors((prev) => ({ ...prev, mediaFile: '' }));
    } catch (err) {
      console.error('Failed to prepare file preview:', err);
      setErrors((prev) => ({ ...prev, mediaFile: 'Could not read file for preview.' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.link.trim()) newErrors.link = 'Link is required';
    if (formData.budget < 2000 || formData.budget > 20000) {
      newErrors.budget = 'Budget must be between 2000 and 20000 credits';
    }
    if (formData.reward < 0 || formData.reward > 100) {
      newErrors.reward = 'Reward must be between 0 and 100 credits';
    }

    // Validate quiz questions
    formData.quiz.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`quiz_${index}`] = 'Question text is required';
      }
      if (question.type === 'multiple') {
        const filledOptions = question.options.filter(opt => opt.trim());
        if (filledOptions.length < 2) {
          newErrors[`quiz_options_${index}`] = 'At least 2 options are required';
        }
      } else if (question.type === 'short' && !question.answer.trim()) {
        newErrors[`quiz_answer_${index}`] = 'Correct answer is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const createAd = async (adData) => {
  //   const formDataToSend = new FormData();

  //   // Add text fields
  //   formDataToSend.append('ad_uuid', adData.ad_uuid);
  //   formDataToSend.append('title', adData.title);
  //   formDataToSend.append('description', adData.description);
  //   formDataToSend.append('link', adData.link);
  //   formDataToSend.append('mediaLink', adData.mediaLink);
  //   formDataToSend.append('format', adData.format);
  //   formDataToSend.append('budget', adData.budget.toString());
  //   formDataToSend.append('reward', adData.reward.toString());
  //   formDataToSend.append('frequency', adData.frequency);

  //   // Add quiz data as JSON string
  //   formDataToSend.append('quiz', JSON.stringify(adData.quiz));

  //   // Add media file if present
  //   if (adData.mediaFile) {
  //     formDataToSend.append('media', adData.mediaFile);
  //   }

  //   const response = await createAdroute(formDataToSend);
  //   console.log('Ad created response:', response);
  //   // const response = await fetch(`${API_BASE_URL}/api/ads/ad`, {
  //   //   method: 'POST',
  //   //   // headers: {
  //   //   //   'Authorization': `Bearer ${token}`
  //   //   // },
  //   //   body: formDataToSend
  //   // });

  //   // if (!response.ok) {
  //   //   const errorData = await response.json();
  //   //   throw new Error(errorData.error || 'Failed to create ad');
  //   // }

  //   setTimeout(() => {
  //     navigate(`/preview-ad/ad/${ad_uuid}`);
  //     return response;
  //   }, 1000);

  // };

  // const updateAd = async (adId, adData) => {
  //   const formDataToSend = new FormData();

  //   // Add text fields
  //   formDataToSend.append('ad_uuid', adData.ad_uuid);
  //   formDataToSend.append('title', adData.title);
  //   formDataToSend.append('description', adData.description);
  //   formDataToSend.append('link', adData.link);
  //   formDataToSend.append('format', adData.format);
  //   formDataToSend.append('budget', adData.budget.toString());
  //   formDataToSend.append('reward', adData.reward.toString());
  //   formDataToSend.append('frequency', adData.frequency);

  //   // Add quiz data as JSON string
  //   formDataToSend.append('quiz', JSON.stringify(adData.quiz));

  //   // Add media file if present
  //   if (adData.mediaFile) {
  //     formDataToSend.append('media', adData.mediaFile);
  //   }

  //   const response = await updateAdroute(formDataToSend);
  //   console.log('Ad updated response:', response);

  //   // const response = await fetch(`${API_BASE_URL}/api/ads/ad/${adId}`, {
  //   //   method: 'PUT',
  //   //   headers: {
  //   //     'Authorization': `Bearer ${token}`
  //   //   },
  //   //   body: formDataToSend
  //   // });

  //   if (!response.ok) {
  //     const errorData = await response.json();
  //     throw new Error(errorData.error || 'Failed to update ad');
  //   }

  //   // setTimeout(() => {
  //   if (confirm("Do you want a preview of the updated AD?")) {
  //     navigate(`/preview-ad/ad/${ad_uuid}`);
  //     return response;
  //   }

  //   // }, 1000);

  //   // return response.json();
  // };

  const createAd = async (adData) => {
    const formDataToSend = new FormData();
    formDataToSend.append('ad_uuid', adData.ad_uuid);
    formDataToSend.append('title', adData.title);
    formDataToSend.append('description', adData.description);
    formDataToSend.append('link', adData.link);
    formDataToSend.append('mediaLink', adData.mediaLink || ''); // <-- link you just got
    formDataToSend.append('format', adData.format);
    formDataToSend.append('budget', String(adData.budget));
    formDataToSend.append('reward', String(adData.reward));
    formDataToSend.append('frequency', adData.frequency);
    formDataToSend.append('quiz', JSON.stringify(adData.quiz));

    const response = await createAdroute(formDataToSend);
    console.log('Ad created response:', response);

    // Navigate happens in handleSubmit
    return response;
  };

  const updateAd = async (adId, adData) => {
    const formDataToSend = new FormData();
    formDataToSend.append('ad_uuid', adData.ad_uuid);
    formDataToSend.append('title', adData.title);
    formDataToSend.append('description', adData.description);
    formDataToSend.append('link', adData.link);
    formDataToSend.append('mediaLink', adData.mediaLink || '');
    formDataToSend.append('format', adData.format);
    formDataToSend.append('budget', String(adData.budget));
    formDataToSend.append('reward', String(adData.reward));
    formDataToSend.append('frequency', adData.frequency);
    formDataToSend.append('quiz', JSON.stringify(adData.quiz));

    const response = await updateAdroute(formDataToSend);
    console.log('Ad updated response:', response);
    return response;
  };


  // const handleSubmit = async () => {
  //   if (!validateForm()) {
  //     setNotification({
  //       open: true,
  //       message: 'Please fix the errors in the form',
  //       severity: 'error'
  //     });
  //     return;
  //   }

  //   if (!token) {
  //     setNotification({
  //       open: true,
  //       message: 'Authentication required. Please log in.',
  //       severity: 'error'
  //     });
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     let result;
  //     if (editingAd) {
  //       result = await updateAd(editingAd.id, formData);
  //       setNotification({
  //         open: true,
  //         message: 'Advertisement updated successfully!',
  //         severity: 'success'
  //       });
  //     } else {
  //       result = await createAd(formData);
  //       setNotification({
  //         open: true,
  //         message: 'Advertisement created successfully!',
  //         severity: 'success'
  //       });

  //       // Reset form after successful creation
  //       setFormData({
  //         ad_uuid: setAD_uuid(uuidv4()),
  //         title: '',
  //         description: '',
  //         link: '',
  //         format: 'regular',
  //         mediaFile: null,
  //         budget: 2000,
  //         reward: 0,
  //         frequency: 'moderate',
  //         quiz: [
  //           { question: '', type: 'multiple', options: ['', '', '', ''], correct: 0, answer: '' }
  //         ]
  //       });
  //     }

  //     // Call parent onSave if provided
  //     if (onSave) {
  //       onSave(result);
  //     }

  //   } catch (error) {
  //     console.error('Error saving ad:', error);
  //     setNotification({
  //       open: true,
  //       message: error.message || 'Failed to save advertisement',
  //       severity: 'error'
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setNotification({ open: true, message: 'Please fix the errors in the form', severity: 'error' });
      return;
    }
    if (!token) {
      setNotification({ open: true, message: 'Authentication required. Please log in.', severity: 'error' });
      return;
    }

    setLoading(true);

    try {
      // 1) Ensure we have a mediaLink (upload now if not yet uploaded)
      let mediaLink = formData.mediaFileLink;
      if (!mediaLink && formData.mediaFile) {
        mediaLink = await uploadToBackend(formData.mediaFile); // server returns { mediaLink }
        setFormData((prev) => ({ ...prev, mediaFileLink: mediaLink }));
      }

      // 2) Build payload for create/update (no raw File, just link + fields)
      const adPayload = {
        ...formData,
        mediaLink,
      };
      delete adPayload.mediaFile; // don't send the file; upload already done
      delete adPayload.mediaDataUrl; // preview only
      delete adPayload.mediaMimeType;
      delete adPayload.mediaName;

      let result;
      if (editingAd) {
        result = await updateAd(editingAd.id, adPayload);
        setNotification({ open: true, message: 'Advertisement updated successfully!', severity: 'success' });
      } else {
        result = await createAd(adPayload);
        setNotification({ open: true, message: 'Advertisement created successfully!', severity: 'success' });

        // Reset ad_uuid and form (fixing the setAD_uuid() misuse)
        const newUuid = uuidv4();
        setAD_uuid(newUuid);
        setFormData({
          ad_uuid: newUuid,
          title: '',
          description: '',
          link: '',
          format: 'regular',
          mediaFile: null,
          mediaFileLink: '',
          mediaDataUrl: '',
          mediaMimeType: '',
          mediaName: '',
          budget: 2000,
          reward: 0,
          frequency: 'moderate',
          quiz: [{ question: '', type: 'multiple', options: ['', '', '', ''], correct: 0, answer: '' }]
        });
      }

      if (onSave) onSave(result);

      // Optional: navigate to preview of the created ad
      setTimeout(() => {
        navigate(`/preview-ad/${ad_uuid}`);
      }, 500);
    } catch (error) {
      console.error('Error saving ad:', error);
      setNotification({ open: true, message: error.message || 'Failed to save advertisement', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };


  const goToAdPreview = (adData) => {
    // if (ad?.link) {
    window.open("/preview/pending-ad/", '_blank');
    // }
  };

  // const handlePreviewAd = async () => {
  //   if (!validateForm()) {
  //     setNotification({
  //       open: true,
  //       message: 'Please fix the errors in the form',
  //       severity: 'error'
  //     });
  //     return;
  //   }

  //   if (!token) {
  //     setNotification({
  //       open: true,
  //       message: 'Authentication required. Please log in.',
  //       severity: 'error'
  //     });
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     let result;

  //     localStorage.setItem('previewAdData', JSON.stringify(formData));
  //     // navigate(`/preview/pending-ad/?ad_uuid=${formData.ad_uuid}&title=${encodeURIComponent(formData.title)}&description=${encodeURIComponent(formData.description)}&link=${encodeURIComponent(formData.link)}&format=${formData.format}&budget=${formData.budget}&reward=${formData.reward}&frequency=${formData.frequency}&quiz=${encodeURIComponent(JSON.stringify(formData.quiz))}`);
  //     // navigate(`/preview/pending-ad/`);

  //     goToAdPreview(formData);

  //     // Call parent onSave if provided
  //     if (onSave) {
  //       onSave(result);
  //     }

  //   } catch (error) {
  //     console.error('Error saving ad:', error);
  //     setNotification({
  //       open: true,
  //       message: error.message || 'Failed to save advertisement',
  //       severity: 'error'
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePreviewAd = async () => {
    if (!validateForm()) {
      setNotification({ open: true, message: 'Please fix the errors in the form', severity: 'error' });
      return;
    }
    if (!token) {
      setNotification({ open: true, message: 'Authentication required. Please log in.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Persist everything needed by the preview page
      localStorage.setItem('previewAdData', JSON.stringify(formData));
      // Open preview
      window.open("/preview/pending-ad/", "_blank");
    } catch (error) {
      console.error('Error preparing preview:', error);
      setNotification({ open: true, message: error.message || 'Could not open preview', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };


  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,rgb(210, 216, 247) 0%,rgb(174, 144, 206) 100%)',
      p: { xs: 2, sm: 3, md: 4 }
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* <Avatar sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)'
          }}>
            <Target sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h3" component="h1" sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            color: 'transparent',
            mb: 1
          }}>
            {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Create engaging ads with interactive quizzes to boost user engagement and drive conversions
          </Typography> */}


          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            color: 'white',
            fontSize: '40px'
          }}>
            🎯
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            textShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            Create Advertisement
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.25rem',
            maxWidth: '600px',
            margin: '0 auto',
            fontWeight: 400,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Create engaging ads with interactive quizzes with rewards to boost user engagement.
          </p>
          {/* </div> */}
        </Box>

        <Stack spacing={3}>
          {/* Basic Information */}
          <StyledPaper>
            <GradientHeader bgcolor="linear-gradient(135deg, #1976d2, #42a5f5)">
              <EyeIcon />
              <Typography variant="h6" component="h2">
                Basic Information
              </Typography>
            </GradientHeader>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>

              </Grid>
              <Grid item xs={12} >
                <Typography variant="body2" component="h2">
                  ID#: ${ad_uuid}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ad Title *"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="Enter an engaging ad title..."
                  variant="outlined"
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Destination Link *"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  error={!!errors.link}
                  helperText={errors.link}
                  placeholder="https://your-website.com"
                  variant="outlined"
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description *"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="Describe your advertisement in detail. What makes it special?"
                  variant="outlined"
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </StyledPaper>

          {/* Format & Media */}
          <StyledPaper>
            <GradientHeader bgcolor="linear-gradient(135deg, #9c27b0, #ba68c8)">
              <UploadIcon />
              <Typography variant="h6" component="h2">
                Format & Media
              </Typography>
            </GradientHeader>

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Ad Format
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {formatOptions.map((option) => (
                <Grid item xs={6} sm={4} md={2} key={option.value}>
                  <FormatCard selected={formData.format === option.value}>
                    <CardContent
                      sx={{ textAlign: 'center', p: 2, cursor: loading ? 'not-allowed' : 'pointer' }}
                      onClick={() => !loading && handleInputChange('format', option.value)}
                    >
                      <Typography variant="h4" sx={{ mb: 1 }}>{option.icon}</Typography>
                      <Typography variant="body2" fontWeight="bold">{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{option.description}</Typography>
                    </CardContent>
                  </FormatCard>
                </Grid>
              ))}
            </Grid>

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Media Upload
            </Typography>
            <UploadZone
              onDrop={loading ? undefined : handleFileDrop}
              onDragOver={loading ? undefined : (e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={loading ? undefined : () => setDragOver(false)}
              isDragOver={dragOver}
              hasError={!!errors.mediaFile}
              component="label"
              display={'flex'}
              sx={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            >
              <input
                type="file"
                hidden
                onChange={handleFileUpload}
                disabled={loading}
                accept={
                  formData.format === 'video' ? 'video/*' :
                    formData.format === 'audio' ? 'audio/*,image/*' :
                      'image/*'
                }
              />
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <div style={{ paddingLeft: '25%', margin: '10px', alignContent: 'center', textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {formData.mediaFile ? formData.mediaFile.name : 'Drag & drop your media file here'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  or click to browse files
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Max size: {formData.format === 'video' ? '2.5MB' : '2MB'}
                </Typography>
              </div>
            </UploadZone>
            {errors.mediaFile && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.mediaFile}
              </Alert>
            )}
          </StyledPaper>

          {/* Campaign Settings */}
          <StyledPaper>
            <GradientHeader bgcolor="linear-gradient(135deg, #4caf50, #81c784)">
              <ZapIcon />
              <Typography variant="h6" component="h2">
                Campaign Settings
              </Typography>
            </GradientHeader>

            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Target sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="bold">Budget (Credits)</Typography>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                  error={!!errors.budget}
                  helperText={errors.budget || 'Range: 2,000 - 20,000 credits'}
                  inputProps={{ min: 2000, max: 20000, step: 100 }}
                  variant="outlined"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AwardIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="bold">Reward (Credits)</Typography>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  value={formData.reward}
                  onChange={(e) => handleInputChange('reward', parseInt(e.target.value))}
                  error={!!errors.reward}
                  helperText={errors.reward || 'Credits per user interaction'}
                  inputProps={{ min: 0, max: 100 }}
                  variant="outlined"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Display Frequency
                </Typography>
                <FormControl fullWidth disabled={loading}>
                  <Select
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    variant="outlined"
                  >
                    {frequencyOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ fontSize: '1.2em' }}>{option.icon}</Typography>
                          <Box>
                            <Typography variant="body1">{option.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </StyledPaper>

          {/* Quiz Questions */}
          <StyledPaper>
            <GradientHeader bgcolor="linear-gradient(135deg, #ff9800, #ffb74d)">
              <HelpIcon />
              <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                Interactive Quiz Questions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addQuizQuestion}
                disabled={loading}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                Add Question
              </Button>
            </GradientHeader>

            <Stack spacing={3}>
              {formData.quiz.map((question, index) => (
                <QuestionCard key={index}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{
                          bgcolor: 'primary.main',
                          width: 40,
                          height: 40,
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                          Question {index + 1}
                        </Typography>
                      </Box>
                      {formData.quiz.length > 1 && (
                        <IconButton
                          onClick={() => removeQuizQuestion(index)}
                          disabled={loading}
                          color="error"
                          sx={{
                            '&:hover': {
                              bgcolor: 'error.light',
                              color: 'white'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Question"
                        value={question.question}
                        onChange={(e) => handleQuizChange(index, 'question', e.target.value)}
                        placeholder="Enter your question here..."
                        variant="outlined"
                        disabled={loading}
                        error={!!errors[`quiz_${index}`]}
                        helperText={errors[`quiz_${index}`]}
                      />

                      <FormControl fullWidth disabled={loading}>
                        <InputLabel>Question Type</InputLabel>
                        <Select
                          value={question.type}
                          onChange={(e) => handleQuizChange(index, 'type', e.target.value)}
                          label="Question Type"
                        >
                          <MenuItem value="multiple">📝 Multiple Choice</MenuItem>
                          <MenuItem value="short">✏️ Short Answer</MenuItem>
                        </Select>
                      </FormControl>

                      {question.type === 'multiple' ? (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Answer Options:
                          </Typography>
                          <RadioGroup
                            value={question.correct}
                            onChange={(e) => handleQuizChange(index, 'correct', parseInt(e.target.value))}
                          >
                            <Stack spacing={2}>
                              {question.options.map((option, optionIndex) => (
                                <Box key={optionIndex} sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  p: 2,
                                  bgcolor: 'grey.50',
                                  borderRadius: 1
                                }}>
                                  <FormControlLabel
                                    value={optionIndex}
                                    control={<Radio disabled={loading} />}
                                    label=""
                                  />
                                  <TextField
                                    fullWidth
                                    value={option}
                                    onChange={(e) => handleQuizOptionChange(index, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    variant="outlined"
                                    size="small"
                                    disabled={loading}
                                  />
                                </Box>
                              ))}
                            </Stack>
                          </RadioGroup>
                          {errors[`quiz_options_${index}`] && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                              {errors[`quiz_options_${index}`]}
                            </Alert>
                          )}
                          <Alert severity="info" sx={{ mt: 2 }}>
                            Select the radio button next to the correct answer
                          </Alert>
                        </Box>
                      ) : (
                        <TextField
                          fullWidth
                          label="Correct Answer"
                          value={question.answer}
                          onChange={(e) => handleQuizChange(index, 'answer', e.target.value)}
                          placeholder="Enter the correct answer..."
                          variant="outlined"
                          disabled={loading}
                          error={!!errors[`quiz_answer_${index}`]}
                          helperText={errors[`quiz_answer_${index}`]}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </QuestionCard>
              ))}
            </Stack>
          </StyledPaper>

          {/* Submit Button */}
          <Box sx={{ mt: 4 }}>
            <StyledPaper>
              <Button
                style={{ marginBottom: '10px' }}
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handlePreviewAd}
                disabled={loading}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: loading ? 'rgba(25, 118, 210, 0.5)' : 'linear-gradient(135deg, #1976d2, #42a5f5)',
                  '&:hover': {
                    background: loading ? 'rgba(25, 118, 210, 0.5)' : 'linear-gradient(135deg, #1565c0, #1976d2)',
                    transform: loading ? 'none' : 'translateY(-2px)',
                    boxShadow: loading ? 'none' : 4
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading
                  ? (editingAd ? 'Updating Advertisement...' : 'Creating Advertisement...')
                  : (editingAd ? 'Preview Update Advertisement' : 'Preview New Ad')
                }
              </Button>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: loading ? 'rgba(62, 210, 25, 0.5)' : 'linear-gradient(135deg, #4ad219ff, #42f57eff)',
                  '&:hover': {
                    background: loading ? 'rgba(62, 210, 25, 0.5)' : 'linear-gradient(135deg, #1dc015ff, #2fd219ff)',
                    transform: loading ? 'none' : 'translateY(-2px)',
                    boxShadow: loading ? 'none' : 4
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading
                  ? (editingAd ? 'Updating Advertisement...' : 'Creating Advertisement...')
                  : (editingAd ? 'Update Advertisement' : 'Create Advertisement')
                }
              </Button>
            </StyledPaper>
          </Box>

          {/* <Box sx={{ position: 'sticky', gap: 10, bottom: 16, zIndex: 10 }}>
            <StyledPaper>
              <Button
                style={{ marginBottom: '10px' }}
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handlePreviewAd}
                disabled={loading}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: loading ? 'rgba(25, 118, 210, 0.5)' : 'linear-gradient(135deg, #1976d2, #42a5f5)',
                  '&:hover': {
                    background: loading ? 'rgba(25, 118, 210, 0.5)' : 'linear-gradient(135deg, #1565c0, #1976d2)',
                    transform: loading ? 'none' : 'translateY(-2px)',
                    boxShadow: loading ? 'none' : 4
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading
                  ? (editingAd ? 'Updating Advertisement...' : 'Creating Advertisement...')
                  : (editingAd ? 'Preview Update Advertisement' : 'Preview New Ad')
                }
              </Button> */}
          {/* <br>2</br> */}
          {/* <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: loading ? 'rgba(62, 210, 25, 0.5)' : 'linear-gradient(135deg, #4ad219ff, #42f57eff)',
                  '&:hover': {
                    background: loading ? 'rgba(62, 210, 25, 0.5)' : 'linear-gradient(135deg, #1dc015ff, #2fd219ff)',
                    transform: loading ? 'none' : 'translateY(-2px)',
                    boxShadow: loading ? 'none' : 4
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading
                  ? (editingAd ? 'Updating Advertisement...' : 'Creating Advertisement...')
                  : (editingAd ? 'Update Advertisement' : 'Create Advertisement')
                }
              </Button> */}
          {/* </StyledPaper> */}
          {/* </Box> */}
        </Stack>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default CreateAdPage;
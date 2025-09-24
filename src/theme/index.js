import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0a0a', // Deep black for general page background
      paper: '#1a1a1a',   // Dark gray for Cards and Paper elements
    },
    primary: {
      main: '#ffd700',     // Bright gold/yellow
      light: '#ffed4e',    // Lighter yellow
      dark: '#ffb300',     // Darker yellow/amber
      contrastText: '#000000',
    },
    secondary: {
      main: '#ffff00',     // Bright neon yellow
      light: '#ffff66',    // Light neon yellow
      dark: '#cccc00',     // Dark yellow
      contrastText: '#000000',
    },
    tertiary: {
      main: '#ffec8b',     // Soft glowing yellow
    },
    text: {
      primary: '#ffffff',   // White text
      secondary: '#ffd700', // Yellow secondary text
    },
    divider: '#ffd700',     // Yellow dividers
    error: {
      main: '#ff6b6b',      // Softer red for errors
    },
    warning: {
      main: '#ffa726',      // Orange for warnings
    },
    info: {
      main: '#29b6f6',      // Blue for info
    },
    success: {
      main: '#66bb6a',      // Green for success
    },
  },
  typography: {
    fontSize: 10,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#ffd700',
      textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#ffd700',
      textShadow: '0 0 8px rgba(255, 215, 0, 0.4)',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#ffd700',
      textShadow: '0 0 6px rgba(255, 215, 0, 0.3)',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#ffd700',
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#ffd700',
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#ffd700',
    },
    body1: {
      fontSize: '0.875rem',
      color: '#ffffff',
    },
    body2: {
      fontSize: '0.75rem',
      color: '#e0e0e0',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          zoom: '85%',
          backgroundColor: '#0a0a0a',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1a1a1a',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#ffd700',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#ffed4e',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: '1px solid #ffd700',
          borderRadius: '8px',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
            borderColor: '#ffed4e',
          },
        },
        contained: {
          backgroundColor: '#ffd700',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#ffed4e',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
          },
        },
        outlined: {
          borderColor: '#ffd700',
          color: '#ffd700',
          '&:hover': {
            borderColor: '#ffed4e',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #ffd700',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 25px rgba(255, 215, 0, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #ffd700',
          borderRadius: '8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#ffd700',
            },
            '&:hover fieldset': {
              borderColor: '#ffed4e',
              boxShadow: '0 0 5px rgba(255, 215, 0, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ffd700',
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#ffd700',
          },
          '& .MuiInputBase-input': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0a0a0a',
          border: '1px solid #ffd700',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          boxShadow: '0 2px 10px rgba(255, 215, 0, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          borderRight: '2px solid #ffd700',
          boxShadow: '2px 0 10px rgba(255, 215, 0, 0.2)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          border: '1px solid transparent',
          borderRadius: '6px',
          margin: '2px 4px',
          '&:hover': {
            border: '1px solid #ffd700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            boxShadow: '0 0 8px rgba(255, 215, 0, 0.3)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
            border: '1px solid #ffd700',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#ffd700',
          border: '1px solid transparent',
          borderRadius: '8px',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid #ffd700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.4)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#ffd700',
          boxShadow: '0 0 2px rgba(255, 215, 0, 0.3)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #ffd700',
          color: '#ffd700',
          boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a1a',
          border: '2px solid #ffd700',
          borderRadius: '12px',
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#ffd700',
          color: '#ffffff',
        },
        head: {
          backgroundColor: '#1a1a1a',
          color: '#ffd700',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          border: '1px solid #ffd700',
          color: '#ffd700',
          '&:hover': {
            boxShadow: '0 0 8px rgba(255, 215, 0, 0.4)',
          },
        },
      },
    },
  },
});

export default theme;
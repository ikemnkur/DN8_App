import { createTheme } from '@mui/material/styles';

const reducedFontTheme = createTheme({
  typography: {
    fontSize: 10, // Default is 14, so this reduces it by 2 points
    h1: {
      fontSize: '2rem', // Adjust as needed
    },
    h2: {
      fontSize: '1.75rem',
    },
    h3: {
      fontSize: '1.5rem',
    },
    // Continue adjusting other variants if necessary
  },
});

const theme = createTheme({
  palette: {
    background: {
      // default: '#87CEFA', // Light SkyBlue for general page background
      default: '#C7EEFA', // Light SkyBlue for general page background
      paper: '#FFFFFF',   // Keep MUI Cards and Paper elements white
    },
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    tertiary: {
      main: '#4cf08e',
    },
  },
  typography: {
    fontSize: 10,
    // ... your other typography overrides
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        padding: '0px', // Optional: remove default body padding
        body: {
          zoom: '85%',  // Optional: scales your UI to 80%
          // Any other global body-level styles (e.g., fonts, etc.)
        },
      },
    },
  },
});

// export default theme;

// const theme = createTheme({
//   body: {
//     zoom: "80%", /* Scales the content to 80% */
//     backgroundColor: "#ffffae"
//   },
//   // background:{co},
//   typography: {
//     fontSize: 10, // Base font size
//     h1: {
//       fontSize: '2rem', // Reduced from default 3rem
//     },
//     h2: {
//       fontSize: '1.75rem', // Reduced from default 2.125rem
//     },
//     h3: {
//       fontSize: '1.5rem', // Reduced from default 1.5rem
//     },
//     h4: {
//       fontSize: '1.25rem', // Reduced from default 1.25rem
//     },
//     h5: {
//       fontSize: '1rem', // Reduced from default 1rem
//     },
//     h6: {
//       fontSize: '0.875rem', // Reduced from default 0.875rem
//     },
//     body1: {
//       fontSize: '0.875rem', // Reduced from default 1rem
//     },
//     body2: {
//       fontSize: '0.75rem', // Reduced from default 0.875rem
//     },
//     // Adjust other variants as needed
//   },
//   palette: {
//     primary: {
//       main: '#1976d2',
//     },
//     secondary: {
//       main: '#dc004e',
//     },
//     tertiary: {
//       main: '#4cf08e',
//     },
//   },
//   // You can customize other aspects of the theme here
// });

export default theme;
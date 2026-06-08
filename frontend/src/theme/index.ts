import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:   { main: '#000000', dark: '#1a1a1a' },
    secondary: { main: '#f0f0f3' },
    error:     { main: '#eb8e90' },
    warning:   { main: '#ab6400' },
    success:   { main: '#16a34a' },
    background:{ default: '#ffffff', paper: '#ffffff' },
    text:      { primary: '#171717', secondary: '#60646c' },
    divider:   '#f0f0f3',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
    h1: { fontWeight: 600, letterSpacing: '-1.92px', fontSize: '64px', lineHeight: 1.05 },
    h2: { fontWeight: 600, letterSpacing: '-1.44px', fontSize: '48px', lineHeight: 1.1 },
    h3: { fontWeight: 600, letterSpacing: '-1.08px', fontSize: '36px', lineHeight: 1.15 },
    h4: { fontWeight: 600, letterSpacing: '-0.84px', fontSize: '28px', lineHeight: 1.2 },
    h5: { fontWeight: 600, letterSpacing: '-0.5px', fontSize: '22px', lineHeight: 1.25 },
    h6: { fontWeight: 600, letterSpacing: '0px', fontSize: '18px', lineHeight: 1.4 },
    body1: { fontSize: '16px', lineHeight: 1.5, color: '#60646c' },
    body2: { fontSize: '14px', lineHeight: 1.5, color: '#60646c' },
    button: { fontWeight: 500, fontSize: '14px', lineHeight: 1.0, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Developer dialect pill
          padding: '10px 18px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': { backgroundColor: '#1a1a1a' },
        },
        outlined: {
          borderColor: '#dcdee0',
          color: '#171717',
          backgroundColor: '#ffffff',
          '&:hover': { backgroundColor: '#fafafa', borderColor: '#171717' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid #f0f0f3', // Hairline border
          boxShadow: 'none',
          borderRadius: 12,
          '&:hover': { 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
            transform: 'translateY(-2px)', 
            transition: 'all 0.2s ease' 
          },
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#dcdee0' }, // Hairline strong
            '&:hover fieldset': { borderColor: '#999999' },
            '&.Mui-focused fieldset': { borderColor: '#171717', borderWidth: '2px' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { 
        root: { 
          borderRadius: 4, 
          fontWeight: 600, 
          fontSize: '11px',
          letterSpacing: '0.88px',
          textTransform: 'uppercase',
          backgroundColor: '#f0f0f3',
          color: '#171717',
        } 
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { 
          backgroundColor: '#ffffff', 
          borderRight: '1px solid #f0f0f3' 
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { 
          backgroundColor: '#ffffff', 
          borderBottom: '1px solid #f0f0f3',
          color: '#171717',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    }
  },
});

export default theme;

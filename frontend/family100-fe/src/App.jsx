import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import AdminPanel from "./components/AdminPanel";
import PresenterBoard from "./components/PresenterBoard";

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a',
      light: '#3b82f6',
      dark: '#1e40af',
    },
    secondary: {
      main: '#fbbf24',
      light: '#fde68a',
      dark: '#f59e0b',
    },
    success: {
      main: '#059669',
    },
    warning: {
      main: '#ea580c',
    },
    error: {
      main: '#dc2626',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

function Navigation() {
  const location = useLocation();
  
  // Hide navigation on presenter page
  if (location.pathname === '/presenter') {
    return null;
  }
  
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          SKK Migas Family 100 Quiz
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/admin"
            color="inherit"
            variant={location.pathname === '/admin' ? 'contained' : 'text'}
            sx={{
              backgroundColor: location.pathname === '/admin' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Admin Panel
          </Button>
          <Button
            component={Link}
            to="/presenter"
            color="inherit"
            variant={location.pathname === '/presenter' ? 'contained' : 'text'}
            sx={{
              backgroundColor: location.pathname === '/presenter' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Presenter Board
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/presenter" element={<PresenterBoard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

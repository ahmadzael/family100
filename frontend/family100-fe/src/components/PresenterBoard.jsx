import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Container,
  Alert,
  Fade,
  Paper,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Help as HelpIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export default function PresenterBoard() {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  const fetchState = async () => {
    try {
      setError(null);
      const res = await fetch("/api/game");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    const data = await res.json();
    setState(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch game state:", err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!state && !error) return <div className="p-6 text-center text-2xl">Loading...</div>;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            transform: 'skewY(-2deg)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(-45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            transform: 'skewY(2deg)',
          },
        }}
      />

      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            icon={<WarningIcon />}
            sx={{ 
              position: 'relative',
              zIndex: 10,
              mb: 2,
              borderRadius: 0,
            }}
          >
            <Typography variant="h6">
              <strong>Error:</strong> {error}
            </Typography>
          </Alert>
        </Fade>
      )}
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, py: 4 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Paper
            elevation={10}
            sx={{
              p: 4,
              mb: 4,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                color: '#fbbf24',
                fontWeight: 900,
                mb: 2,
                letterSpacing: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              SKK MIGAS
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 2,
              }}
            >
              FAMILY 100 QUIZ
            </Typography>
            <Divider sx={{ borderColor: '#fbbf24', width: 200, mx: 'auto' }} />
          </Paper>
          
          <Card elevation={8} sx={{ maxWidth: 800, mx: 'auto' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  lineHeight: 1.3,
                }}
              >
                {state?.current_question?.text || "No Question Set"}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Answers Section */}
        {state?.current_question?.answers && (
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={3}>
              {state.current_question.answers.map((a, i) => (
                <Grid item xs={12} md={6} key={i}>
                  <Card
                    elevation={a.revealed ? 12 : 4}
                    sx={{
                      position: 'relative',
                      overflow: 'visible',
                      transform: a.revealed ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: a.revealed 
                        ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                        : 'rgba(255, 255, 255, 0.95)',
                      color: a.revealed ? 'white' : 'text.primary',
                      border: a.revealed ? '3px solid #fbbf24' : '2px solid #e5e7eb',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 8,
                      },
                    }}
                  >
                    {/* Answer Number Badge */}
                    <Avatar
                      sx={{
                        position: 'absolute',
                        top: -20,
                        left: -20,
                        width: 60,
                        height: 60,
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        bgcolor: a.revealed ? '#fbbf24' : 'primary.main',
                        color: a.revealed ? '#059669' : 'white',
                        boxShadow: 3,
                      }}
                    >
                      {i + 1}
                    </Avatar>
                    
                    <CardContent sx={{ p: 3, pt: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: '1.5rem',
                            }}
                          >
                            {a.revealed ? a.text : "???"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 900,
                              color: a.revealed ? '#fbbf24' : 'text.secondary',
                            }}
                          >
                            {a.revealed ? a.score : "?"}
                          </Typography>
                          {a.revealed && (
                            <CheckCircleIcon
                              sx={{
                                fontSize: '2rem',
                                color: '#fbbf24',
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Team Scores Section */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={8}
              sx={{
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                color: 'white',
                textAlign: 'center',
                p: 4,
                border: '3px solid #fbbf24',
                transform: 'hover:scale(1.02)',
                transition: 'transform 0.3s ease',
              }}
            >
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                  TEAM A
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    color: '#fbbf24',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  {state?.team_scores?.A || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              elevation={8}
              sx={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                color: 'white',
                textAlign: 'center',
                p: 4,
                border: '3px solid #fbbf24',
                transform: 'hover:scale(1.02)',
                transition: 'transform 0.3s ease',
              }}
            >
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                  TEAM B
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    color: '#fbbf24',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  {state?.team_scores?.B || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Strikes Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Paper
            elevation={6}
            sx={{
              display: 'inline-block',
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              color: 'white',
              borderRadius: 3,
              border: '3px solid #fbbf24',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              STRIKES
            </Typography>
          </Paper>
          <Typography
            variant="h2"
            sx={{
              color: '#fbbf24',
              fontWeight: 900,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {"❌".repeat(state?.strikes || 0)}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

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
      console.log('Fetched game data:', data);
      // derive current session state from game
      if (data && data.active_session && data.sessions && data.sessions[data.active_session]) {
        const sessionData = data.sessions[data.active_session];
        console.log('Current session data:', sessionData);
        console.log('Team scores:', sessionData.teamScores);
        setState(sessionData);
      } else {
        console.warn('No active session found in response');
        setState(null);
      }
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

  // Debug log to inspect the state
  console.log('Current state:', state);
  
  if (!state) return <div className="p-6 text-center text-2xl">Loading game state...</div>;
  
  // Get the current question
  const currentQuestion = state.questions?.find(q => q.id === state.current_question_id) || 
                        state.questions?.[0]; // Fallback to first question if current_question_id not found
  
  console.log('Current question:', currentQuestion);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Enhanced Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.15,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            transform: 'skewY(-1deg)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.2) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(120, 200, 255, 0.1) 0%, transparent 50%)',
            transform: 'skewY(1deg)',
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
                color: '#ffffff',
                fontWeight: 900,
                mb: 2,
                letterSpacing: 2,
                textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                background: 'linear-gradient(45deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SKK MIGAS FAMILY 100 QUIZ
            </Typography>
            <Divider sx={{ borderColor: '#ffffff', width: 200, mx: 'auto', borderWidth: 2 }} />
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
                {currentQuestion?.text || "No Question Set"}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Answers Section */}
        {currentQuestion?.answers && currentQuestion.answers.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={3}>
              {currentQuestion.answers.map((a, i) => (
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
                      border: a.revealed ? '3px solid #6366f1' : '2px solid #e5e7eb',
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
                        bgcolor: a.revealed ? '#6366f1' : 'primary.main',
                        color: a.revealed ? '#ffffff' : 'white',
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
                              color: a.revealed ? '#6366f1' : 'text.secondary',
                            }}
                          >
                            {a.revealed ? a.score : "?"}
                          </Typography>
                          {a.revealed && (
                            <CheckCircleIcon
                              sx={{
                                fontSize: '2rem',
                                color: '#6366f1',
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
                border: '3px solid #6366f1',
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
                    color: '#ffffff',
                    textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                    animation: 'pulse 2s infinite',
                    background: 'linear-gradient(45deg, #ffffff 0%, #f0f9ff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
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
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                color: 'white',
                textAlign: 'center',
                p: 4,
                border: '3px solid #6366f1',
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
                    color: '#ffffff',
                    textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                    animation: 'pulse 2s infinite',
                    background: 'linear-gradient(45deg, #ffffff 0%, #f0f9ff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
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
              border: '3px solid #6366f1',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              STRIKES
            </Typography>
          </Paper>
          <Typography
            variant="h2"
            sx={{
              color: '#ffffff',
              fontWeight: 900,
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              background: 'linear-gradient(45deg, #ffffff 0%, #fef3c7 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {"❌".repeat(state?.strikes || 0)}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

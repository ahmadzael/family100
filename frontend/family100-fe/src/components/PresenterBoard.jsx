import { useEffect, useState, useRef } from "react";
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
  const prevStateRef = useRef(null);
  
  // Sound effects using Web Audio API
  const playSound = (frequency, duration, type = 'sine') => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };
  
  const playRevealSound = () => {
    // Success sound - ascending notes
    playSound(523.25, 0.1); // C5
    setTimeout(() => playSound(659.25, 0.1), 100); // E5
    setTimeout(() => playSound(783.99, 0.2), 200); // G5
  };
  
  const playStrikeSound = () => {
    // Error sound - buzzer
    playSound(200, 0.15, 'sawtooth');
    setTimeout(() => playSound(150, 0.15, 'sawtooth'), 150);
    setTimeout(() => playSound(100, 0.2, 'sawtooth'), 300);
  };

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
        
        // Check for changes and play sounds
        if (prevStateRef.current) {
          // Check for strike changes
          if (sessionData.strikes > prevStateRef.current.strikes) {
            playStrikeSound();
          }
          
          // Check for revealed answers
          const currentQ = sessionData.questions?.find(q => q.id === sessionData.current_question_id);
          const prevQ = prevStateRef.current.questions?.find(q => q.id === prevStateRef.current.current_question_id);
          
          if (currentQ && prevQ) {
            const newRevealed = currentQ.answers?.filter((a, i) => 
              a.revealed && !prevQ.answers?.[i]?.revealed
            );
            if (newRevealed && newRevealed.length > 0) {
              playRevealSound();
            }
          }
        }
        
        prevStateRef.current = sessionData;
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
        background: '#F5E6C8',
        position: 'relative',
        overflow: 'hidden',
        '@media (min-width: 1920px)': {
          fontSize: '1.2rem',
        },
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

      <Container 
        maxWidth={false}
        sx={{ 
          position: 'relative', 
          zIndex: 10, 
          py: 2,
          px: 3,
          maxWidth: '1920px',
          mx: 'auto',
        }}
      >
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Paper
            elevation={10}
            sx={{
              p: 2,
              mb: 2,
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: '2px solid #D85D5D',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                color: '#D85D5D',
                fontWeight: 900,
                mb: 1,
                letterSpacing: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                fontSize: '2.5rem',
              }}
            >
              SKK MIGAS FAMILY 100 QUIZ
            </Typography>
            <Divider sx={{ borderColor: '#D85D5D', borderWidth: 2, width: 250, mx: 'auto' }} />
          </Paper>

          <Card 
            elevation={8} 
            sx={{ 
              maxWidth: 1200, 
              mx: 'auto',
              background: '#3B4F8C',
              border: '3px solid #D85D5D',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.3,
                  fontSize: '1.8rem',
                }}
              >
                {currentQuestion?.text || "No Question Set"}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Answers Section */}
        {currentQuestion?.answers && currentQuestion.answers.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: currentQuestion.answers.length === 6 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 2 }}>
              {currentQuestion.answers.map((a, i) => (
                <Card
                  key={i}
                  elevation={a.revealed ? 12 : 4}
                  sx={{
                    position: 'relative',
                    overflow: 'visible',
                    transform: a.revealed ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: a.revealed
                      ? '#3B4F8C'
                      : 'rgba(255, 255, 255, 0.9)',
                    color: a.revealed ? 'white' : '#333',
                    border: a.revealed ? '3px solid #D85D5D' : '2px solid #D85D5D',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
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
                      top: -15,
                      left: -15,
                      width: 55,
                      height: 55,
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      bgcolor: a.revealed ? '#D85D5D' : '#3B4F8C',
                      color: 'white',
                      boxShadow: 3,
                    }}
                  >
                    {i + 1}
                  </Avatar>

                  <CardContent sx={{ p: 2.5, pt: 3, width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ flexGrow: 1, mr: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.3rem',
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
                            color: a.revealed ? '#D85D5D' : '#999',
                            fontSize: '2rem',
                          }}
                        >
                          {a.revealed ? a.score : "?"}
                        </Typography>
                        {a.revealed && (
                          <CheckCircleIcon
                            sx={{
                              fontSize: '2rem',
                              color: '#D85D5D',
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Free Text Score Display Section */}
        {state?.free_text_score && (
          <Box sx={{ mb: 2.5, textAlign: 'center' }}>
            <Paper
              elevation={6}
              sx={{
                display: 'inline-block',
                p: 2.5,
                background: '#3B4F8C',
                color: 'white',
                borderRadius: 2,
                border: '3px solid #D85D5D',
                minWidth: '300px',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, fontSize: '1.2rem' }}>
                SKOR BEBAS
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: '#D85D5D',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  fontSize: '2.5rem',
                }}
              >
                {state.free_text_score}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Team Scores Section */}
        <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={8}
              sx={{
                background: '#D85D5D',
                color: 'white',
                textAlign: 'center',
                p: 2.5,
                border: '3px solid #3B4F8C',
                transform: 'hover:scale(1.02)',
                transition: 'transform 0.3s ease',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, fontSize: '2rem' }}>
                  TEAM A
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    color: 'white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    animation: 'pulse 2s infinite',
                    fontSize: '4rem',
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
                background: '#3B4F8C',
                color: 'white',
                textAlign: 'center',
                p: 2.5,
                border: '3px solid #D85D5D',
                transform: 'hover:scale(1.02)',
                transition: 'transform 0.3s ease',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, fontSize: '2rem' }}>
                  TEAM B
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    color: 'white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    animation: 'pulse 2s infinite',
                    fontSize: '4rem',
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
              p: 2.5,
              mb: 2,
              background: '#D85D5D',
              color: 'white',
              borderRadius: 2,
              border: '3px solid #3B4F8C',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, fontSize: '1.3rem' }}>
              STRIKES
            </Typography>
          </Paper>
          <Typography
            variant="h2"
            sx={{
              color: '#D85D5D',
              fontWeight: 900,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              fontSize: '3.5rem',
            }}
          >
            {"❌".repeat(state?.strikes || 0)}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

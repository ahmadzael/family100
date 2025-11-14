import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  Stack,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Visibility as VisibilityIcon,
  AddCircle as AddCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

export default function AdminPanel() {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([{ text: "", score: "" }]);
  const [state, setState] = useState(null);
  const [sessions, setSessions] = useState({});
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [freeTextScore, setFreeTextScore] = useState("");
  const [customPointsA, setCustomPointsA] = useState("");
  const [customPointsB, setCustomPointsB] = useState("");
  const [timerDuration, setTimerDuration] = useState(10);

  const playSound = (soundFile) => {
    const audio = new Audio(soundFile);
    audio.play();
  };

  const fetchState = async () => {
    try {
      setError(null);
      const res = await fetch("/api/game");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setSessions(data.sessions || {});
      setActiveSession(data.active_session);
      
      if (data.active_session && data.sessions[data.active_session]) {
        setState(data.sessions[data.active_session]);
      } else {
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

  const addAnswer = () => {
    setAnswers([...answers, { text: "", score: "" }]);
  };

  const createSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSessionName }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setNewSessionName("");
      await fetchState();
    } catch (err) {
      setError(err.message);
      console.error("Failed to create session:", err);
    } finally {
      setLoading(false);
    }
  };

  const switchSession = async (sessionId) => {
    try {
      setError(null);
      const res = await fetch("/api/sessions/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      await fetchState();
    } catch (err) {
      setError(err.message);
      console.error("Failed to switch session:", err);
    }
  };

  const addQuestion = async () => {
    if (!activeSession) {
      setError("No active session");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/sessions/${activeSession}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: question,
          answers: answers.map((a) => ({ text: a.text, score: Number(a.score) })),
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setQuestion("");
      setAnswers([{ text: "", score: "" }]);
      await fetchState();
    } catch (err) {
      setError(err.message);
      console.error("Failed to add question:", err);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentQuestion = async (questionId) => {
    if (!activeSession) {
      setError("No active session");
      return;
    }
    
    try {
      setError(null);
      const res = await fetch(`/api/sessions/${activeSession}/questions/${questionId}/set`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      await fetchState();
    } catch (err) {
      setError(err.message);
      console.error("Failed to set current question:", err);
    }
  };

  const revealAnswer = async (questionId, answerIndex) => {
    if (!activeSession) {
      setError("No active session");
      return;
    }
    
    try {
      playSound('/reveal.mp3');
      setError(null);
      const res = await fetch(`/api/sessions/${activeSession}/questions/${questionId}/answers/${answerIndex}/reveal`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      await fetchState();
    } catch (err) {
      setError(err.message);
      console.error("Failed to reveal answer:", err);
    }
  };

  const action = async (endpoint) => {
    if (!activeSession) {
      setError("No active session");
      return;
    }

    if (endpoint === "strike") {
      playSound('/strike.mp3');
    } else if (endpoint === "reveal") {
      playSound('/reveal.mp3');
    }
    
    try {
      setError(null);
      let url = "";
      if (endpoint === "strike") {
        url = `/api/sessions/${activeSession}/strike`;
      } else if (endpoint.startsWith("points/")) {
        const team = endpoint.split("/")[1];
        url = `/api/sessions/${activeSession}/points/${team}`;
      } else if (endpoint === "reset") {
        url = `/api/sessions/${activeSession}/reset`;
      } else if (endpoint === 'reset-strikes') {
        url = `/api/sessions/${activeSession}/strikes/reset`;
      }
      
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      await fetchState();
    } catch (err) {
      setError(err.message);
      console.error(`Failed to execute ${endpoint}:`, err);
    }
  };

  const addCustomPoints = async (team, points) => {
    if (!activeSession) {
      setError("No active session");
      return;
    }
    
    const pointsNum = parseInt(points);
    console.log('Adding custom points:', { team, points, pointsNum });
    
    if (isNaN(pointsNum) || pointsNum <= 0) {
      setError("Please enter a valid positive number");
      return;
    }
    
    try {
      setError(null);
      const url = `/api/sessions/${activeSession}/points/${team}/custom`;
      console.log('Sending request to:', url);
      console.log('Request body:', { points: pointsNum });
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: pointsNum }),
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
      }
      
      const result = await res.json();
      console.log('Success response:', result);
      
      await fetchState();
      // Clear input after success
      if (team === "A") setCustomPointsA("");
      if (team === "B") setCustomPointsB("");
    } catch (err) {
      setError(err.message);
      console.error(`Failed to add custom points:`, err);
    }
  };

  const updateFreeTextScore = async () => {
    if (!activeSession) {
      setError("No active session");
      return;
    }
    
    try {
      setError(null);
      const res = await fetch(`/api/sessions/${activeSession}/freetextscore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: freeTextScore }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      await fetchState();
    } catch (err) {
      setError(err.message);
      console.error("Failed to update free text score:", err);
    }
  };

  const startTimer = async () => {
    if (!activeSession) {
      setError("No active session");
      return;
    }
    try {
      setError(null);
      const res = await fetch(`/api/sessions/${activeSession}/timer/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: timerDuration }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      await fetchState();
    } catch (err) {
      setError(err.message);
      console.error("Failed to start timer:", err);
    }
  };

  const stopTimer = async () => {
    if (!activeSession) {
      setError("No active session");
      return;
    }
    try {
      setError(null);
      const res = await fetch(`/api/sessions/${activeSession}/timer/stop`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      await fetchState();
    } catch (err) {
      setError(err.message);
      console.error("Failed to stop timer:", err);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
            Game Administration
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your SKK Migas Family 100 Quiz sessions
          </Typography>
        </Box>

        {/* Session Management */}
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardHeader
            title="Session Management"
            subheader="Create and manage game sessions"
            avatar={<PlayIcon color="primary" />}
          />
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="New Session Name"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Enter session name..."
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={createSession}
                  disabled={loading || !newSessionName.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  Create Session
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Active: {activeSession ? sessions[activeSession]?.name || "Unknown" : "None"}
                </Typography>
              </Grid>
            </Grid>
            
            {Object.keys(sessions).length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Available Sessions:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Object.entries(sessions).map(([id, session]) => (
                    <Chip
                      key={id}
                      label={session.name}
                      color={id === activeSession ? "primary" : "default"}
                      variant={id === activeSession ? "filled" : "outlined"}
                      onClick={() => switchSession(id)}
                      clickable
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
        
        {/* Error Alert */}
        {error && (
          <Fade in={!!error}>
            <Alert 
              severity="error" 
              icon={<WarningIcon />}
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              <Typography variant="body1">
                <strong>Error:</strong> {error}
              </Typography>
            </Alert>
          </Fade>
        )}

        <Grid container spacing={3}>
          {/* Question Setup Card */}
          <Grid item xs={12} lg={6}>
            <Card elevation={3}>
              <CardHeader
                title="Question Setup"
                subheader="Create and configure your game question"
                avatar={<PlayIcon color="primary" />}
              />
              <CardContent>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Question"
                    placeholder="Enter your question here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    multiline
                    rows={2}
                    variant="outlined"
                  />

                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Answers
                    </Typography>
                    <Stack spacing={2}>
                      {answers.map((a, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Chip 
                            label={i + 1} 
                            color="primary" 
                            size="small"
                            sx={{ minWidth: 40 }}
                          />
                          <TextField
                            fullWidth
                            placeholder={`Answer ${i + 1}`}
                            value={a.text}
                            onChange={(e) => {
                              const newAns = [...answers];
                              newAns[i].text = e.target.value;
                              setAnswers(newAns);
                            }}
                            variant="outlined"
                            size="small"
                          />
                          <TextField
                            type="number"
                            placeholder="Score"
                            value={a.score}
                            onChange={(e) => {
                              const newAns = [...answers];
                              newAns[i].score = e.target.value;
                              setAnswers(newAns);
                            }}
                            variant="outlined"
                            size="small"
                            sx={{ width: 100 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addAnswer}
                      variant="outlined"
                      color="primary"
                    >
                      Add Answer
                    </Button>
                    <Button
                      startIcon={loading ? <CircularProgress size={20} /> : <PlayIcon />}
                      onClick={addQuestion}
                      variant="contained"
                      color="primary"
                      disabled={loading || !activeSession}
                      sx={{ flexGrow: 1 }}
                    >
                      {loading ? "Adding..." : "Add Question"}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Game Controls Card */}
          <Grid item xs={12} lg={6}>
            <Card elevation={3}>
              <CardHeader
                title="Game Controls"
                subheader="Control the game flow and scoring"
                avatar={<VisibilityIcon color="primary" />}
              />
              <CardContent>
                <Stack spacing={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<VisibilityIcon />}
                        onClick={() => action("reveal")}
                      >
                        Reveal Answer
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="warning"
                        startIcon={<WarningIcon />}
                        onClick={() => action("strike")}
                      >
                        Add Strike
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="warning"
                        startIcon={<RefreshIcon />}
                        onClick={() => action("reset-strikes")}
                      >
                        Reset Strikes
                      </Button>
                    </Grid>
                  </Grid>
                  
                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Timer Controls
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Duration (s)"
                          value={timerDuration}
                          onChange={(e) => setTimerDuration(parseInt(e.target.value, 10))}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Button fullWidth variant="contained" color="info" onClick={startTimer}>
                          Start Timer
                        </Button>
                      </Grid>
                      <Grid item xs={4}>
                        <Button fullWidth variant="outlined" color="info" onClick={stopTimer}>
                          Stop Timer
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Quick Points
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          startIcon={<AddCircleIcon />}
                          onClick={() => action("points/A")}
                        >
                          +10 Team A
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          startIcon={<AddCircleIcon />}
                          onClick={() => action("points/B")}
                        >
                          +10 Team B
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Custom Points - Team A
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        type="number"
                        placeholder="Enter points"
                        value={customPointsA}
                        onChange={(e) => setCustomPointsA(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ flexGrow: 1 }}
                        inputProps={{ min: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => addCustomPoints("A", customPointsA)}
                        disabled={!activeSession || !customPointsA}
                        sx={{ minWidth: '100px' }}
                      >
                        Add to A
                      </Button>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Custom Points - Team B
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        type="number"
                        placeholder="Enter points"
                        value={customPointsB}
                        onChange={(e) => setCustomPointsB(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ flexGrow: 1 }}
                        inputProps={{ min: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => addCustomPoints("B", customPointsB)}
                        disabled={!activeSession || !customPointsB}
                        sx={{ minWidth: '100px' }}
                      >
                        Add to B
                      </Button>
                    </Box>
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={<RefreshIcon />}
                    onClick={() => action("reset")}
                    size="large"
                  >
                    Reset Game
                  </Button>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Skor Bebas
                    </Typography>
                    <TextField
                      fullWidth
                      label="Masukkan Skor Bebas"
                      value={freeTextScore}
                      onChange={(e) => setFreeTextScore(e.target.value)}
                      placeholder="Contoh: 50, 100, 200..."
                      variant="outlined"
                      multiline
                      rows={2}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          '& input': {
                            textAlign: 'center',
                          },
                        },
                      }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={updateFreeTextScore}
                      disabled={!activeSession}
                    >
                      Update Skor Bebas
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Input ini untuk menampilkan skor bebas pada presenter board
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Questions Management */}
        {state && state.questions && state.questions.length > 0 && (
          <Card elevation={3} sx={{ mt: 3 }}>
            <CardHeader
              title="Questions Management"
              subheader="Manage questions and reveal answers selectively"
              avatar={<VisibilityIcon color="primary" />}
            />
            <CardContent>
              <Grid container spacing={3}>
                {state.questions.map((question) => (
                  <Grid item xs={12} md={6} key={question.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Question {question.id}
                          </Typography>
                          <Chip
                            label={question.id === state.current_question_id ? "Active" : "Inactive"}
                            color={question.id === state.current_question_id ? "primary" : "default"}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {question.text}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Answers:
                          </Typography>
                          <Stack spacing={1}>
                            {question.answers.map((answer, index) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  label={answer.text}
                                  color={answer.revealed ? "success" : "default"}
                                  size="small"
                                  icon={answer.revealed ? <CheckCircleIcon /> : undefined}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  ({answer.score})
                                </Typography>
                                {!answer.revealed && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => revealAnswer(question.id, index)}
                                  >
                                    Reveal
                                  </Button>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                        
                        <Button
                          fullWidth
                          variant={question.id === state.current_question_id ? "contained" : "outlined"}
                          color="primary"
                          onClick={() => setCurrentQuestion(question.id)}
                        >
                          {question.id === state.current_question_id ? "Current Question" : "Set as Current"}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Game State Card */}
        {state && (
          <Card elevation={3} sx={{ mt: 3 }}>
            <CardHeader
              title="Current Game State"
              subheader="Live view of the current game status"
              avatar={<CheckCircleIcon color="success" />}
            />
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Question</strong></TableCell>
                      <TableCell><strong>Answers</strong></TableCell>
                      <TableCell align="center"><strong>Team A</strong></TableCell>
                      <TableCell align="center"><strong>Team B</strong></TableCell>
                      <TableCell align="center"><strong>Strikes</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2">
                          {state.questions?.find(q => q.id === state.current_question_id)?.text || "No question set"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          {state.questions?.find(q => q.id === state.current_question_id)?.answers?.map((a, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={a.text}
                                color={a.revealed ? "success" : "default"}
                                size="small"
                                icon={a.revealed ? <CheckCircleIcon /> : undefined}
                              />
                              <Typography variant="caption" color="text.secondary">
                                ({a.score})
                              </Typography>
                            </Box>
                          )) || "No answers"}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={state.team_scores?.A || 0} 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={state.team_scores?.B || 0} 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={state.strikes || 0} 
                          color="warning" 
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}

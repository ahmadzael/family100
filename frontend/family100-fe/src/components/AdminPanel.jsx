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
  const [loading, setLoading] = useState(false);
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

  const addAnswer = () => {
    setAnswers([...answers, { text: "", score: "" }]);
  };

  const setGameQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/game/question", {
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
      await fetchState();
    } catch (err) {
      setError(err.message);
      console.error("Failed to set question:", err);
    } finally {
      setLoading(false);
    }
  };

  const action = async (endpoint) => {
    try {
      setError(null);
      const res = await fetch(`/api/game/${endpoint}`, { method: "POST" });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      await fetchState();
    } catch (err) {
      setError(err.message);
      console.error(`Failed to execute ${endpoint}:`, err);
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
            Manage your SKK Migas Family 100 Quiz session
          </Typography>
        </Box>
        
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
                      onClick={setGameQuestion}
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      sx={{ flexGrow: 1 }}
                    >
                      {loading ? "Setting..." : "Set Question"}
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
                    <Grid item xs={6}>
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
                  </Grid>
                  
                  <Divider />
                  
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
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
                          {state.current_question?.text || "No question set"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          {state.current_question?.answers?.map((a, i) => (
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

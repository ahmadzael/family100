package infra

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"familyfeud/internal/game"
)

type GameHandler struct {
	service game.UseCase
}

func NewGameHandler(service game.UseCase) *GameHandler {
	return &GameHandler{service: service}
}

func (h *GameHandler) RegisterRoutes(mux *http.ServeMux) {
	// Game management
	mux.HandleFunc("/api/game", h.getGame)
	mux.HandleFunc("/api/game/session/activesession", h.getActiveSession)

	// Session management
	mux.HandleFunc("/api/sessions", h.createSession)
	mux.HandleFunc("/api/sessions/activate", h.setActiveSession)
	// Catch-all router for session-scoped actions
	mux.HandleFunc("/api/sessions/", h.sessionsRouter)

	// Question management
	// handled by sessionsRouter

	// Game controls
	// handled by sessionsRouter
}

// --- Handlers ---

func (h *GameHandler) getGame(w http.ResponseWriter, r *http.Request) {
	gameState, err := h.service.GetGame()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, gameState)
}

func (h *GameHandler) getActiveSession(w http.ResponseWriter, r *http.Request) {
	session, err := h.service.GetActiveSession()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, session)
}

func (h *GameHandler) createSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	var req struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	session, err := h.service.CreateSession(req.Name)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, session)
}

func (h *GameHandler) setActiveSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	var req struct {
		SessionID string `json:"sessionId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	if req.SessionID == "" {
		http.Error(w, "missing session id", 400)
		return
	}
	if err := h.service.SetActiveSession(req.SessionID); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]string{"status": "ok"})
}

// sessionsRouter is a catch-all router for paths under /api/sessions/ that include a sessionID
// Supported patterns:
// POST   /api/sessions/{sessionID}                                  -> activate session (alternate to /activate)
// POST   /api/sessions/{sessionID}/questions                         -> add question
// POST   /api/sessions/{sessionID}/questions/{questionID}/set        -> set current question
// POST   /api/sessions/{sessionID}/questions/{questionID}/answers/{answerIndex}/reveal -> reveal answer
// POST   /api/sessions/{sessionID}/strike                            -> add strike
// POST   /api/sessions/{sessionID}/points/{team}                     -> add points
// POST   /api/sessions/{sessionID}/reset                             -> reset session
// DELETE /api/sessions/{sessionID}                                   -> delete session
func (h *GameHandler) sessionsRouter(w http.ResponseWriter, r *http.Request) {
	base := "/api/sessions/"
	if !strings.HasPrefix(r.URL.Path, base) {
		http.NotFound(w, r)
		return
	}
	path := r.URL.Path[len(base):]
	// Normalize to avoid trailing slash issues
	if path == "" {
		// no action here; creation is handled at /api/sessions
		http.Error(w, "invalid session path", 400)
		return
	}

	parts := strings.Split(path, "/")
	// Allow POST /api/sessions/{sessionID} to set active session
	if len(parts) == 1 {
		sessionID := parts[0]
		switch r.Method {
		case http.MethodPost:
			if err := h.service.SetActiveSession(sessionID); err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
			writeJSON(w, map[string]string{"status": "ok"})
			return
		case http.MethodDelete:
			if err := h.service.DeleteSession(sessionID); err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
			writeJSON(w, map[string]string{"status": "ok"})
			return
		}
	}

	// Delegate to existing handlers that parse the path after /api/sessions/
	if len(parts) >= 2 && parts[1] == "questions" {
		// Could be addQuestion or setCurrentQuestion or revealAnswer
		if r.Method == http.MethodPost {
			if len(parts) == 2 {
				// /{sessionID}/questions -> addQuestion
				h.addQuestion(w, r)
				return
			}
			if len(parts) >= 4 && parts[3] == "set" {
				// /{sessionID}/questions/{questionID}/set -> set current question
				h.setCurrentQuestion(w, r)
				return
			}
			if len(parts) >= 6 && parts[3] == "answers" && parts[5] == "reveal" {
				// /{sessionID}/questions/{questionID}/answers/{answerIndex}/reveal -> reveal answer
				h.revealAnswer(w, r)
				return
			}
		}
	}

	if len(parts) >= 2 && parts[1] == "strike" && r.Method == http.MethodPost {
		h.addStrike(w, r)
		return
	}
	if len(parts) >= 3 && parts[1] == "points" && r.Method == http.MethodPost {
		h.addPoints(w, r)
		return
	}
	if len(parts) >= 2 && parts[1] == "reset" && r.Method == http.MethodPost {
		h.resetSession(w, r)
		return
	}

	http.Error(w, "invalid session path", 400)
}

func (h *GameHandler) addQuestion(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	// URL: /api/sessions/{sessionID}/questions
	path := r.URL.Path[len("/api/sessions/"):]
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[1] != "questions" {
		http.Error(w, "invalid path", 400)
		return
	}
	sessionID := parts[0]

	var q game.Question
	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	if err := h.service.AddQuestion(sessionID, q); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]string{"status": "ok"})
}

func (h *GameHandler) setCurrentQuestion(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	// URL: /api/sessions/{sessionID}/questions/{questionID}/set
	path := r.URL.Path[len("/api/sessions/"):]
	parts := strings.Split(path, "/")
	if len(parts) < 4 || parts[1] != "questions" || parts[3] != "set" {
		http.Error(w, "invalid path", 400)
		return
	}
	sessionID := parts[0]
	questionID, err := strconv.Atoi(parts[2])
	if err != nil {
		http.Error(w, "invalid question id", 400)
		return
	}

	if err := h.service.SetCurrentQuestion(sessionID, questionID); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]string{"status": "ok"})
}

func (h *GameHandler) revealAnswer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	// URL: /api/sessions/{sessionID}/questions/{questionID}/answers/{answerIndex}/reveal
	path := r.URL.Path[len("/api/sessions/"):]
	parts := strings.Split(path, "/")
	if len(parts) < 6 || parts[1] != "questions" || parts[3] != "answers" || parts[5] != "reveal" {
		http.Error(w, "invalid path", 400)
		return
	}
	sessionID := parts[0]
	questionID, err := strconv.Atoi(parts[2])
	if err != nil {
		http.Error(w, "invalid question id", 400)
		return
	}
	answerIndex, err := strconv.Atoi(parts[4])
	if err != nil {
		http.Error(w, "invalid answer index", 400)
		return
	}

	if err := h.service.RevealAnswer(sessionID, questionID, answerIndex); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]string{"status": "ok"})
}

func (h *GameHandler) addStrike(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	// URL: /api/sessions/{sessionID}/strike
	path := r.URL.Path[len("/api/sessions/"):]
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[1] != "strike" {
		http.Error(w, "invalid path", 400)
		return
	}
	sessionID := parts[0]

	if err := h.service.AddStrike(sessionID); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]string{"status": "ok"})
}

func (h *GameHandler) addPoints(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	// URL: /api/sessions/{sessionID}/points/{team}
	path := r.URL.Path[len("/api/sessions/"):]
	parts := strings.Split(path, "/")
	if len(parts) < 3 || parts[1] != "points" {
		http.Error(w, "invalid path", 400)
		return
	}
	sessionID := parts[0]
	team := parts[2]

	if err := h.service.AddPoints(sessionID, team, 10); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]string{"status": "ok"})
}

func (h *GameHandler) resetSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	// URL: /api/sessions/{sessionID}/reset
	path := r.URL.Path[len("/api/sessions/"):]
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[1] != "reset" {
		http.Error(w, "invalid path", 400)
		return
	}
	sessionID := parts[0]

	if err := h.service.ResetSession(sessionID); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]string{"status": "ok"})
}

func (h *GameHandler) deleteSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "method not allowed", 405)
		return
	}
	// URL: /api/sessions/{sessionID}
	sessionID := r.URL.Path[len("/api/sessions/"):]
	if sessionID == "" {
		http.Error(w, "missing session id", 400)
		return
	}

	if err := h.service.DeleteSession(sessionID); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]string{"status": "ok"})
}

// --- helper ---
func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
}

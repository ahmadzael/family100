package infra

import (
	"encoding/json"
	"net/http"

	"familyfeud/internal/game"
)

type GameHandler struct {
	service game.UseCase
}

func NewGameHandler(service game.UseCase) *GameHandler {
	return &GameHandler{service: service}
}

func (h *GameHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/game", h.getGame)
	mux.HandleFunc("/api/game/question", h.setQuestion)
	mux.HandleFunc("/api/game/reveal", h.revealAnswer)
	mux.HandleFunc("/api/game/strike", h.addStrike)
	mux.HandleFunc("/api/game/reset", h.resetGame)
	// dynamic points for teams
	mux.HandleFunc("/api/game/points/", h.addPoints)
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

func (h *GameHandler) setQuestion(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	var q game.Question
	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	if err := h.service.SetQuestion(q); err != nil {
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
	// reveal the next unrevealed answer
	gameState, err := h.service.GetGame()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	if gameState.CurrentQuestion == nil {
		http.Error(w, "no question set", 400)
		return
	}
	for i, a := range gameState.CurrentQuestion.Answers {
		if !a.Revealed {
			if err := h.service.RevealAnswer(i); err != nil {
				http.Error(w, err.Error(), 500)
			}
			writeJSON(w, map[string]string{"status": "ok"})
			return
		}
	}
	http.Error(w, "all answers already revealed", 400)
}

func (h *GameHandler) addStrike(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	if err := h.service.AddStrike(); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, map[string]string{"status": "ok"})
}

func (h *GameHandler) resetGame(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	if err := h.service.Reset(); err != nil {
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
	// URL looks like: /api/game/points/A
	team := r.URL.Path[len("/api/game/points/"):]
	if team == "" {
		http.Error(w, "missing team id", 400)
		return
	}
	if err := h.service.AddPoints(team, 10); err != nil {
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

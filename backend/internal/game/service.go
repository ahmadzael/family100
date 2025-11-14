package game

import (
	"fmt"
	"time"
)

type service struct {
	repo Repository
}

func NewService(r Repository) UseCase {
	return &service{repo: r}
}

func (s *service) GetGame() (*Game, error) {
	return s.repo.Load()
}

func (s *service) GetActiveSession() (*GameSession, error) {
	g, err := s.repo.Load()
	if err != nil {
		return nil, err
	}
	if g.ActiveSession == "" {
		return nil, fmt.Errorf("no active session")
	}
	session, exists := g.Sessions[g.ActiveSession]
	if !exists {
		return nil, fmt.Errorf("active session not found")
	}
	return session, nil
}

func (s *service) CreateSession(name string) (*GameSession, error) {
	g, _ := s.repo.Load()
	if g.Sessions == nil {
		g.Sessions = make(map[string]*GameSession)
	}

	sessionID := GenerateID()
	session := &GameSession{
		ID:         sessionID,
		Name:       name,
		Questions:  []Question{},
		CurrentQID: 0,
		TeamScores: map[string]int{"A": 0, "B": 0},
		Strikes:    0,
		CreatedAt:  time.Now().Format(time.RFC3339),
	}

	g.Sessions[sessionID] = session
	g.ActiveSession = sessionID
	return session, s.repo.Save(g)
}

func (s *service) SetActiveSession(sessionID string) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	if _, exists := g.Sessions[sessionID]; !exists {
		return fmt.Errorf("session not found")
	}
	g.ActiveSession = sessionID
	return s.repo.Save(g)
}

func (s *service) AddQuestion(sessionID string, question Question) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	session, exists := g.Sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}

	question.ID = len(session.Questions) + 1
	session.Questions = append(session.Questions, question)
	return s.repo.Save(g)
}

func (s *service) SetCurrentQuestion(sessionID string, questionID int) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	session, exists := g.Sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}

	for _, q := range session.Questions {
		if q.ID == questionID {
			session.CurrentQID = questionID
			session.Strikes = 0
			return s.repo.Save(g)
		}
	}
	return fmt.Errorf("question not found")
}

func (s *service) RevealAnswer(sessionID string, questionID int, answerIndex int) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	session, exists := g.Sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}

	for i, q := range session.Questions {
		if q.ID == questionID {
			if answerIndex < 0 || answerIndex >= len(q.Answers) {
				return fmt.Errorf("invalid answer index")
			}
			session.Questions[i].Answers[answerIndex].Revealed = true
			return s.repo.Save(g)
		}
	}
	return fmt.Errorf("question not found")
}

func (s *service) AddPoints(sessionID string, team string, points int) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	session, exists := g.Sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}
	session.TeamScores[team] += points
	return s.repo.Save(g)
}

func (s *service) AddStrike(sessionID string) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	session, exists := g.Sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}
	session.Strikes++
	return s.repo.Save(g)
}

func (s *service) ResetSession(sessionID string) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	session, exists := g.Sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}
	session.TeamScores = map[string]int{"A": 0, "B": 0}
	session.Strikes = 0
	session.CurrentQID = 0
	return s.repo.Save(g)
}

func (s *service) DeleteSession(sessionID string) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	delete(g.Sessions, sessionID)
	if g.ActiveSession == sessionID {
		g.ActiveSession = ""
	}
	return s.repo.Save(g)
}

func (s *service) SetFreeTextScore(sessionID string, score string) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	session, exists := g.Sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}
	session.FreeTextScore = score
	return s.repo.Save(g)
}

func (s *service) ResetStrikes(sessionID string) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	session, exists := g.Sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}
	session.Strikes = 0
	return s.repo.Save(g)
}

func (s *service) StartTimer(sessionID string, duration int) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	session, exists := g.Sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}

	session.TimerDuration = duration
	session.TimerEndTime = time.Now().Unix() + int64(duration)

	return s.repo.Save(g)
}

func (s *service) StopTimer(sessionID string) error {
	g, err := s.repo.Load()
	if err != nil {
		return err
	}
	session, exists := g.Sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}

	session.TimerEndTime = 0
	session.TimerDuration = 0

	return s.repo.Save(g)
}

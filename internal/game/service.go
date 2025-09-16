package game

import "fmt"

type service struct {
	repo Repository
}

func NewService(r Repository) UseCase {
	return &service{repo: r}
}

func (s *service) GetGame() (*Game, error) {
	return s.repo.Load()
}

func (s *service) SetQuestion(question Question) error {
	g, _ := s.repo.Load()
	g.CurrentQuestion = &question
	g.Strikes = 0
	return s.repo.Save(g)
}

func (s *service) RevealAnswer(index int) error {
	g, _ := s.repo.Load()
	if g.CurrentQuestion == nil {
		return fmt.Errorf("no active question")
	}
	if index < 0 || index >= len(g.CurrentQuestion.Answers) {
		return fmt.Errorf("invalid index")
	}
	g.CurrentQuestion.Answers[index].Revealed = true
	return s.repo.Save(g)
}

func (s *service) AddPoints(team string, points int) error {
	g, _ := s.repo.Load()
	g.TeamScores[team] += points
	return s.repo.Save(g)
}

func (s *service) AddStrike() error {
	g, _ := s.repo.Load()
	g.Strikes++
	return s.repo.Save(g)
}

func (s *service) Reset() error {
	g := &Game{
		TeamScores: map[string]int{"A": 0, "B": 0},
		Strikes:    0,
	}
	return s.repo.Save(g)
}

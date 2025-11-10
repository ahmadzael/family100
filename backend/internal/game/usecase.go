package game

type UseCase interface {
	GetGame() (*Game, error)
	GetActiveSession() (*GameSession, error)
	CreateSession(name string) (*GameSession, error)
	SetActiveSession(sessionID string) error
	AddQuestion(sessionID string, question Question) error
	SetCurrentQuestion(sessionID string, questionID int) error
	RevealAnswer(sessionID string, questionID int, answerIndex int) error
	AddPoints(sessionID string, team string, points int) error
	AddStrike(sessionID string) error
	ResetSession(sessionID string) error
	DeleteSession(sessionID string) error
	SetFreeTextScore(sessionID string, score string) error
}

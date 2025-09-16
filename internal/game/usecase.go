package game

type UseCase interface {
	GetGame() (*Game, error)
	SetQuestion(question Question) error
	RevealAnswer(index int) error
	AddPoints(team string, points int) error
	AddStrike() error
	Reset() error
}

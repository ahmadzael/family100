package game

type Repository interface {
	Save(game *Game) error
	Load() (*Game, error)
}

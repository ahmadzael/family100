package game

import "time"

type Repository interface {
	Save(game *Game) error
	Load() (*Game, error)
}

// Helper function to generate unique IDs
func GenerateID() string {
	return time.Now().Format("20060102150405")
}

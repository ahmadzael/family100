package infra

import (
	"encoding/json"
	"familyfeud/internal/game"
	"io/ioutil"
	"os"
)

type FileRepo struct {
	path string
}

func NewFileRepo(path string) *FileRepo {
	return &FileRepo{path: path}
}

func (r *FileRepo) Save(g *game.Game) error {
	data, _ := json.MarshalIndent(g, "", "  ")
	return ioutil.WriteFile(r.path, data, 0644)
}

func (r *FileRepo) Load() (*game.Game, error) {
	if _, err := os.Stat(r.path); os.IsNotExist(err) {
		return &game.Game{
			TeamScores: map[string]int{"A": 0, "B": 0},
			Strikes:    0,
		}, nil
	}
	data, err := ioutil.ReadFile(r.path)
	if err != nil {
		return nil, err
	}
	var g game.Game
	if err := json.Unmarshal(data, &g); err != nil {
		return nil, err
	}
	return &g, nil
}

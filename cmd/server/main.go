package main

import (
	"log"
	"net/http"

	"familyfeud/internal/game"
	"familyfeud/internal/infra"
)

func main() {
	repo := infra.NewFileRepo("data/data.json")
	service := game.NewService(repo)
	handler := infra.NewGameHandler(service)

	mux := http.NewServeMux()

	// API routes
	handler.RegisterRoutes(mux)

	// static files
	fs := http.FileServer(http.Dir("static"))
	mux.Handle("/", fs)

	log.Println("✅ Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

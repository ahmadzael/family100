package main

import (
	"log"
	"net/http"

	"familyfeud/internal/game"
	"familyfeud/internal/infra"
)

// CORS middleware for stdlib mux
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	repo := infra.NewFileRepo("data/data.json")
	service := game.NewService(repo)
	handler := infra.NewGameHandler(service)

	mux := http.NewServeMux()

	// API routes
	handler.RegisterRoutes(mux)

	// static files (if needed)
	fs := http.FileServer(http.Dir("static"))
	mux.Handle("/", fs)

	// wrap everything with CORS
	handlerWithCORS := withCORS(mux)

	log.Println("✅ Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handlerWithCORS))
}

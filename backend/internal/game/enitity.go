package game

type Answer struct {
	Text     string `json:"text"`
	Score    int    `json:"score"`
	Revealed bool   `json:"revealed"`
}

type Question struct {
	ID      int      `json:"id"`
	Text    string   `json:"text"`
	Answers []Answer `json:"answers"`
}

type GameSession struct {
	ID            string         `json:"id"`
	Name          string         `json:"name"`
	Questions     []Question     `json:"questions"`
	CurrentQID    int            `json:"current_question_id"`
	TeamScores    map[string]int `json:"team_scores"`
	Strikes       int            `json:"strikes"`
	FreeTextScore string         `json:"free_text_score"`
	CreatedAt     string         `json:"created_at"`
	TimerEndTime  int64          `json:"timer_end_time"`
	TimerDuration int            `json:"timer_duration"`
}

type Game struct {
	Sessions      map[string]*GameSession `json:"sessions"`
	ActiveSession string                  `json:"active_session"`
}

package game

type Answer struct {
	Text     string `json:"text"`
	Score    int    `json:"score"`
	Revealed bool   `json:"revealed"`
}

type Question struct {
	Text    string   `json:"text"`
	Answers []Answer `json:"answers"`
}

type Game struct {
	CurrentQuestion *Question      `json:"current_question"`
	TeamScores      map[string]int `json:"team_scores"`
	Strikes         int            `json:"strikes"`
}

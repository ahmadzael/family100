async function setQuestion() {
  const questionText = document.getElementById("questionText").value;
  const answerTexts = document.querySelectorAll(".answer-text");
  const answerScores = document.querySelectorAll(".answer-score");

  let answers = [];
  for (let i = 0; i < answerTexts.length; i++) {
    if (answerTexts[i].value) {
      answers.push({
        text: answerTexts[i].value,
        score: parseInt(answerScores[i].value) || 0,
      });
    }
  }

  await fetch("/api/game/question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: questionText, answers }),
  });
  loadGame();
}

async function revealAnswer() {
  await fetch("/api/game/reveal", { method: "POST" });
  loadGame();
}

async function addPoints(team) {
  await fetch(`/api/game/points/${team}`, { method: "POST" });
  loadGame();
}

async function addStrike() {
  await fetch("/api/game/strike", { method: "POST" });
  loadGame();
}

async function resetGame() {
  await fetch("/api/game/reset", { method: "POST" });
  loadGame();
}

async function loadGame() {
  const res = await fetch("/api/game");
  const data = await res.json();
  document.getElementById("gameState").innerText = JSON.stringify(data, null, 2);
}



function addAnswerInput() {
  const container = document.getElementById("answers");
  const text = document.createElement("input");
  text.type = "text";
  text.placeholder = `Answer ${container.children.length / 2 + 1}`;
  text.className = "answer-text";

  const score = document.createElement("input");
  score.type = "number";
  score.placeholder = "Score";
  score.className = "answer-score";

  container.appendChild(text);
  container.appendChild(score);
}

setInterval(loadGame, 2000);
loadGame();

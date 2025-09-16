async function loadBoard() {
  const res = await fetch("/api/game");
  const game = await res.json();

  document.getElementById("question").innerText =
    game.current_question?.text || "";

  const answersList = document.getElementById("answers");
  answersList.innerHTML = "";

  if (game.current_question) {
    game.current_question.answers.forEach((a, i) => {
      const li = document.createElement("li");
      li.textContent = a.revealed ? `${a.text} - ${a.score}` : "???";
      answersList.appendChild(li);
    });
  }

  document.getElementById("scoreA").innerText = game.team_scores.A || 0;
  document.getElementById("scoreB").innerText = game.team_scores.B || 0;

  const strikesDiv = document.getElementById("strikes");
  strikesDiv.innerHTML = "❌".repeat(game.strikes);
}

setInterval(loadBoard, 1500);
loadBoard();

const startButton = document.getElementById("startBtn");

startButton.addEventListener("click", () => {
  document.getElementById("status").textContent = "Game Started!";
  console.log("Game Started!");
});

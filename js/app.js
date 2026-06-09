const startButton = document.getElementById("startBtn");
const symbols = ["S", "D", "H", "C", "F"];
const portals = document.querySelectorAll(".portal");
let currentMode = "runner";

document.getElementById("runnerModeBtn").addEventListener("click", () => {
  currentMode = "runner";
  document.getElementById("status").textContent = "Runner Mode Selected";
});

document.getElementById("scModeBtn").addEventListener("click", () => {
  currentMode = "sc";
  document.getElementById("status").textContent = "Symbol Catcher Mode Selected";
});

startButton.addEventListener("click", startGame);

function startGame() {
  let sequence = [...symbols];
  shuffle(sequence);

  if (currentMode == "runner")
}

function shuffle(array) {
  for (let i = 0; i < array.length; i++) {
    let randomIndex = Math.floor(Math.random() * array.length);
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }
}

function clearPortals() {
  portals.forEach(portal => {
    portal.textContent = "";
    portal.classList.add("hidden");
  });
}

function showPortals() {
  clearPortals();

  let shuffledPortals = [...portals];
  shuffle(shuffledPortals);

  let activePortals = shuffledPortals.slice(0, 5);

  for(let i = 0; i < 5; i++) {
    activePortals[i].textContent = symbols[i];
    activePortals[i].classList.remove("hidden");
  }
}


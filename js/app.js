const startButton = document.getElementById("startBtn");
const symbols = ["S", "D", "H", "C", "F"];
const portals = document.querySelectorAll(".portal");
const chatMessages = document.getElementById("chatMessages");
const symbolNames1 = {
  "S": ["S", "*"],
  "D": ["D", "+"],
  "H": ["H"],
  "C": ["O", "C"],
  "F": ["F", "Y"]
};
const symbolNames2 = {
  "S": ["S", "Star", "*", "s", "star"],
  "D": ["D", "Diamond", "+", "d", "diamond"],
  "H": ["H", "Hourglass", "h", "hourglass"],
  "C": ["O", "Circle", "C", "o", "c", "circle"],
  "F": ["F", "Flower", "Y", "f", "flower", "y"]
};
const guildMembers = [
  "Vertrauen",
  "KouMizuki",
  "Terravox",
  "Eins",
  "xThannatos",
  "xDAsunaYuuki",
  "fabrication",
  "Eudazairon",
  "IRubrub",
  "Asalvo",
  "Lycte",
  "Wechsel",
  "Charmer",
  "Spaghettieis",
  "MatchaPuff",
  "Punchu",
  "Chouquette",
  "BasicColours",
  "LabysZW",
  "Hanso",
  "Eirian",
  "KimiSaru",
  "MyeChu",
  "evemorphs",
  "HerculePoi",
  "Zanika"
];
const order = ["st", "nd", "rd", "th", "th"];
let currentMode = "runner";
let currentRound = 0;
let currentSequence = [];

document.getElementById("runnerModeBtn").addEventListener("click", () => {
  currentMode = "runner";
  document.getElementById("status").textContent = "Runner Mode Selected";
});

document.getElementById("scModeBtn").addEventListener("click", () => {
  currentMode = "sc";
  document.getElementById("status").textContent = "Symbol Catcher Mode Selected";
});

portals.forEach(portal => {
  portal.addEventListener("click", () => {
    if (portal.classList.contains("hidden")) {
      return;
    }
    let clickedSymbol = portal.textContent;
    if (clickedSymbol === currentSequence[currentRound]) {
      currentRound++;

      if (currentRound === 5) {
        addChatMessage("You hit all 5 symbols!");
        clearPortals();
      }
      else {
        showPortals();
      }
    }
    else {
      addChatMessage(`Game: You flopped on the ${currentRound + 1}${order[currentRound]} round!`);
      addChatMessage(`Game: You have killed your entire party and possibly their will to live. Good job!`);
      clearPortals();
    }
  });
});

startButton.addEventListener("click", startGame);

function startGame() {
  chatMessages.innerHTML = "";
  if (currentMode === "runner") {
    startRunnerMode();
  }
  else {
    startSCMode();
  }
}

function startRunnerMode() {

  currentRound = 0;
  currentSequence = [...symbols];
  shuffle(currentSequence);
  let SCname = guildMembers[Math.floor(Math.random() * guildMembers.length)];

  let curSeq = "";

  for (const symbol of currentSequence) {
    curSeq = curSeq + getRandomCallout(symbol) + " ";
  }

  addChatMessage(`${SCname}: ${curSeq}`);

  showPortals();
}

function startSCMode() {
  let sequence = [...symbols];
  shuffle(sequence);

  document.getElementById("status").textContent = "SC Mode Started";
  document.getElementById("sequence").textContent = sequence.join(" ");

  clearPortals();
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

function getRandomCallout(symbol) {
  const names = symbolNames1[symbol];
  return names[Math.floor(Math.random() * names.length)];
}

function addChatMessage(message) {
  const p = document.createElement("p");
  p.classList.add("chat-message");
  p.textContent = message;

  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

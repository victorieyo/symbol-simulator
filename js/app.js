const SYMBOLS = ["S", "D", "H", "C", "F"];
const ROUND_SUFFIXES = ["st", "nd", "rd", "th", "th"];
const SYMBOL_DISPLAY_TIME = 1000;
const RUNNER_TIME_LIMIT = 10;

const SYMBOL_IMAGES = {
  S: "img/star.png",
  D: "img/diamond.png",
  H: "img/hourglass.png",
  C: "img/circle.png",
  F: "img/flower.png"
};

const CALLOUTS = {
  S: ["S", "*"],
  D: ["D", "+"],
  H: ["H", "X"],
  C: ["O", "C"],
  F: ["F", "Y"]
};

const ACCEPTED_INPUTS = {
  S: ["s", "star", "*"],
  D: ["d", "diamond", "+"],
  H: ["h", "hourglass", "x"],
  C: ["o", "c", "circle"],
  F: ["f", "flower", "y"]
};

const GUILD_MEMBERS = [
  "Vertrauen", "KouMizuki", "Terravox", "Eins", "xThannatos",
  "xDAsunaYuuki", "fabrication", "Eudazairon", "IRubrub", "Asalvo",
  "Lycte", "Wechsel", "Charmer", "Spaghettieis", "MatchaPuff",
  "Punchu", "Chouquette", "BasicColours", "LabysZW", "Hanso",
  "Eirian", "KimiSaru", "MyeChu", "evemorphs", "HerculePoi", "Zanika"
];

const elements = {
  startButton: document.getElementById("startBtn"),
  modeSelect: document.getElementById("modeSelect"),
  timerText: document.getElementById("timerText"),
  sequence: document.getElementById("sequence"),
  chatInput: document.getElementById("chatInput"),
  chatSubmitButton: document.getElementById("chatSubmitBtn"),
  chatMessages: document.getElementById("chatMessages"),
  portals: document.querySelectorAll(".portal"),
  platforms: document.querySelectorAll(".platform"),
  resultSequence: document.getElementById("resultSequence"),
};

let gameState = {
  mode: "runner",
  roundActive: false,
  currentRound: 0,
  currentSequence: [],
  scIndex: 0,
  canSubmitSC: false,
  answerChecked: false,
  timerInterval: null,
  timeLeft: RUNNER_TIME_LIMIT
};

init();

function init() {
  hidePlatforms();

  elements.startButton.addEventListener("click", startGame);
  elements.modeSelect.addEventListener("change", () => {
    setMode(elements.modeSelect.value);
  });

  elements.chatSubmitButton.addEventListener("click", submitChatInput);
  elements.chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitChatInput();
  });

  elements.portals.forEach((portal) => {
    portal.addEventListener("click", () => handlePortalClick(portal));
  });
  setChatInputEnabled(false);
}

// =====================
// Game Flow
// =====================

function startGame() {
  if (gameState.roundActive) return;

  elements.resultSequence.innerHTML = "";
  elements.resultSequence.classList.add("hidden");
  gameState.roundActive = true;
  elements.chatMessages.innerHTML = "";
  lockControls();

  if (gameState.mode === "runner") {
    startRunnerMode();
  } else {
    startSCMode();
  }
}

function endRound() {
  gameState.roundActive = false;
  gameState.canSubmitSC = false;
  gameState.answerChecked = false;

  stopTimer();

  elements.sequence.innerHTML = "";
  elements.timerText.textContent = "Time: --";
  elements.sequence.style.display = "none";

  unlockControls();
}

function setMode(mode) {
  gameState.mode = mode;
}

// =====================
// Runner Mode
// =====================

function startRunnerMode() {
  showPlatforms();

  elements.sequence.innerHTML = "";
  elements.sequence.style.display = "none";

  gameState.currentRound = 0;
  gameState.currentSequence = shuffle([...SYMBOLS]);

  const caller = getRandomItem(GUILD_MEMBERS);
  const callout = gameState.currentSequence
    .map((symbol) => getRandomCallout(symbol))
    .join(" ");

  addChatMessage(`${caller}: ${callout}`);

  showPortals();
  startTimer(RUNNER_TIME_LIMIT);
}

function handlePortalClick(portal) {
  if (!gameState.roundActive || portal.classList.contains("hidden")) return;

  const clickedSymbol = portal.dataset.symbol;
  const expectedSymbol = gameState.currentSequence[gameState.currentRound];

  if (clickedSymbol !== expectedSymbol) {
    handleWrongPortalClick();
    return;
  }

  gameState.currentRound++;

  if (gameState.currentRound === SYMBOLS.length) {
    addChatMessage("Game: You hit all 5 symbols!");
    showResultSequence(gameState.currentSequence);
    endRound();
    return;
  }

  stopTimer();
  clearPortals();

  setTimeout(() => {
    if (!gameState.roundActive) return;

    showPortals();
    startTimer(RUNNER_TIME_LIMIT);
  }, 1000);
}

function handleWrongPortalClick() {
  const roundNumber = gameState.currentRound + 1;
  const suffix = ROUND_SUFFIXES[gameState.currentRound];

  addChatMessage(`Game: You flopped on the ${roundNumber}${suffix} round!`);
  addChatMessage("Game: You have killed your entire party and possibly their will to live. Good job!");

  showResultSequence(gameState.currentSequence);
  endRound();
}

// =====================
// Symbol Catcher Mode
// =====================

function startSCMode() {
  hidePlatforms();
  clearPortals();

  elements.sequence.style.display = "flex";

  gameState.currentSequence = shuffle([...SYMBOLS]);
  gameState.scIndex = 0;
  gameState.canSubmitSC = false;
  gameState.answerChecked = false;

  showNextSymbol();
}

function showNextSymbol() {
  if (!gameState.roundActive) return;

  if (gameState.scIndex >= gameState.currentSequence.length) {
    elements.sequence.innerHTML = "";
    elements.sequence.style.display = "none";

    gameState.canSubmitSC = true;
    addChatMessage("Game: Enter the sequence you saw.");
    startTimer(10);
    return;
  }

  elements.sequence.innerHTML = "";

  elements.sequence.appendChild(createSymbolImage(gameState.currentSequence[gameState.scIndex]));
  gameState.scIndex++;
  if (gameState.scIndex >= 4) {
    gameState.canSubmitSC = true;
  }

  setTimeout(hideCurrentSymbol, SYMBOL_DISPLAY_TIME);
}

function hideCurrentSymbol() {
  if (!gameState.roundActive) return;

  elements.sequence.innerHTML = "";
  setTimeout(showNextSymbol, SYMBOL_DISPLAY_TIME);
}

function submitChatInput() {
  const rawInput = elements.chatInput.value.trim();

  if (rawInput === "" || gameState.answerChecked) return;

  if (gameState.mode === "sc" && !gameState.canSubmitSC) {
    addChatMessage("Game: Wait until all symbols have appeared.");
    return;
  }

  addChatMessage(`You: ${rawInput}`);
  elements.chatInput.value = "";

  if (gameState.mode === "sc") {
    checkSCAnswer(rawInput);
  }
}

function checkSCAnswer(rawInput) {
  const userParts = parseUserInput(rawInput);

  if (userParts.length !== gameState.currentSequence.length) {
    addChatMessage("Game: Wrong number of symbols. Try again.");
    return;
  }

  gameState.answerChecked = true;

  for (let i = 0; i < gameState.currentSequence.length; i++) {
    const expectedSymbol = gameState.currentSequence[i];
    const acceptedInputs = ACCEPTED_INPUTS[expectedSymbol];

    if (!acceptedInputs.includes(userParts[i])) {
      addChatMessage(`Game: Wrong at position ${i + 1}.`);
      addChatMessage("Game: You had one job and you failed.");

      addChatMessage(`Game: Correct sequence was ${gameState.currentSequence.join(" ")}`);
      showResultSequence(gameState.currentSequence);
      endRound();
      return;
    }
  }

  addChatMessage("Game: Correct symbol order!");
  addChatMessage("Game: Now just pray that those fools hit the right symbols...");
  showResultSequence(gameState.currentSequence);
  endRound();
}

// =====================
// UI Helpers
// =====================

function showPortals() {
  clearPortals();

  const shuffledPortals = shuffle([...elements.portals]);
  const activePortals = shuffledPortals.slice(0, SYMBOLS.length);

  activePortals.forEach((portal, index) => {
    const symbol = SYMBOLS[index];

    portal.dataset.symbol = symbol;

    portal.appendChild(createSymbolImage(symbol));

    portal.classList.remove("hidden");
  });
}

function clearPortals() {
  elements.portals.forEach((portal) => {
    portal.innerHTML = "";
    portal.dataset.symbol = "";
    portal.classList.add("hidden");
  });
}

function hidePlatforms() {
  elements.platforms.forEach((platform) => {
    platform.classList.add("hidden");
  });
}

function showPlatforms() {
  elements.platforms.forEach((platform) => {
    platform.classList.remove("hidden");
  });
}

function addChatMessage(message) {
  const messageElement = document.createElement("p");

  messageElement.classList.add("chat-message");
  messageElement.textContent = message;

  elements.chatMessages.appendChild(messageElement);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}


function lockControls() {
  elements.startButton.disabled = true;
  elements.modeSelect.disabled = true;
  setChatInputEnabled(gameState.mode === "sc");
}

function unlockControls() {
  elements.startButton.disabled = false;
  elements.modeSelect.disabled = false;
  setChatInputEnabled(false);
}

// =====================
// Timer
// =====================

function startTimer(seconds) {
  stopTimer();

  gameState.timeLeft = seconds;
  updateTimerText();

  gameState.timerInterval = setInterval(() => {
    gameState.timeLeft--;
    updateTimerText();

    if (gameState.timeLeft <= 0) {
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(gameState.timerInterval);
  gameState.timerInterval = null;
}

function updateTimerText() {
  elements.timerText.textContent = `Time: ${gameState.timeLeft}s`;
}

function handleTimeout() {
  addChatMessage("Game: Time's up. Party wiped.");

  if (gameState.mode === "sc") {
    addChatMessage(
      `Game: Correct sequence was ${gameState.currentSequence.join(" ")}`
    );
  }

  showResultSequence(gameState.currentSequence);
  endRound();
}

// =====================
// Utilities
// =====================

function getRandomCallout(symbol) {
  return getRandomItem(CALLOUTS[symbol]);
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
  }

  return result;
}

function createSymbolImage(symbol) {
  const img = document.createElement("img");

  img.src = SYMBOL_IMAGES[symbol];
  img.alt = symbol;
  img.classList.add("symbol-img");

  return img;
}

function setChatInputEnabled(enabled) {
  elements.chatInput.disabled = !enabled;
  elements.chatSubmitButton.disabled = !enabled;
}

function showResultSequence(sequence) {
  hidePlatforms();
  clearPortals();

  elements.sequence.innerHTML = "";
  elements.sequence.style.display = "none";

  elements.resultSequence.innerHTML = "";

  sequence.forEach((symbol) => {
    const circle = document.createElement("div");
    circle.classList.add("result-symbol");

    circle.appendChild(createSymbolImage(symbol));
    elements.resultSequence.appendChild(circle);
  });

  elements.resultSequence.classList.remove("hidden");
}

function parseUserInput(rawInput) {
  const cleanedInput = rawInput.toLowerCase().trim();

  const parts = cleanedInput.split(/\s+/);

  if (parts.length === 5) {
    return parts;
  }

  const withoutSpaces = cleanedInput.replace(/\s+/g, "");

  if (withoutSpaces.length === 5) {
    return withoutSpaces.split("");
  }

  return parts;
}

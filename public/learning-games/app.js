import {
  AddRemoveState,
  ALLOWED_LETTERS,
  BeeFlowerState,
  DIRECTION_KEYS,
  DirectionState,
  LetterState,
  MAZES,
  MazeState,
  NumberGameState,
  randomDifferent,
  randomPair,
} from "./core.js";

const COLORS = [
  "#ef5350",
  "#ff8a65",
  "#ffca28",
  "#9ccc65",
  "#26a69a",
  "#42a5f5",
  "#5c6bc0",
  "#ab47bc",
  "#ec407a",
];

const IMAGE_NAMES = [
  "amusement_parks_01.jpg",
  "amusement_parks_02.jpg",
  "amusement_parks_03.jpg",
  "amusement_parks_04.jpg",
  "amusement_parks_05.jpg",
  "amusement_parks_06.jpg",
  "amusement_parks_07.jpg",
  "amusement_parks_08.jpg",
  "amusement_parks_09.jpg",
  "amusement_parks_10.jpg",
  "babies_01.jpg",
  "babies_02.jpg",
  "babies_03.jpg",
  "babies_04.jpg",
  "babies_05.jpg",
  "cars_01.jpg",
  "cars_02.jpg",
  "cars_03.jpg",
  "cars_04.jpg",
  "cars_05.jpg",
  "cars_06.jpg",
  "cars_07.jpg",
  "cats_01.jpg",
  "cats_02.jpg",
  "cats_03.jpg",
  "cats_04.jpg",
  "cats_05.jpg",
  "cats_06.jpg",
  "cats_07.jpg",
  "cats_08.jpg",
  "dogs_01.jpg",
  "dogs_02.jpg",
  "dogs_03.jpg",
  "dogs_04.jpg",
  "dogs_05.jpg",
  "dogs_06.jpg",
  "dogs_07.jpg",
  "dogs_08.jpg",
  "pirates_01.jpg",
  "pirates_02.jpg",
  "pirates_03.jpg",
  "pirates_04.jpg",
  "pirates_05.jpg",
  "pirates_06.jpg",
  "pirates_07.jpg",
];

const DIRECTION_INFO = {
  8: { word: "ÜLES", speech: "direction_up.wav", color: "#ef5350" },
  2: { word: "ALLA", speech: "direction_down.wav", color: "#42a5f5" },
  4: { word: "VASAKULE", speech: "direction_left.wav", color: "#ab47bc" },
  6: { word: "PAREMALE", speech: "direction_right.wav", color: "#26a69a" },
};

const GAME_DEFINITIONS = [
  {
    id: "numbers",
    title: "1. Numbrite tundmine",
    description: "Vajuta ekraanil näidatud numbrit.",
    color: "#ffca28",
  },
  {
    id: "add-remove",
    title: "2. Liitmine ja lahutamine",
    description: "Lisa plokke klahviga 8 ja eemalda klahviga 2.",
    color: "#9ccc65",
  },
  {
    id: "letters",
    title: "3. Tähtede tundmine",
    description: "Vajuta näidatud tähte ja kuula eestikeelset hääldust.",
    color: "#ff8a65",
  },
  {
    id: "maze",
    title: "4. Mesilase labürint",
    description: "Vii mesilane nooleklahvidega lilleni.",
    color: "#42a5f5",
  },
  {
    id: "directions",
    title: "5. Õpime suundi",
    description: "Õpi: üles, alla, vasakule ja paremale.",
    color: "#ab47bc",
  },
  {
    id: "flowers",
    title: "6. Mesilane ja lilled",
    description: "Liigu vasakule või paremale ja korja lilli.",
    color: "#ec407a",
  },
];

const menu = document.querySelector("#menu");
const gameList = document.querySelector("#game-list");
const gameScreen = document.querySelector("#game-screen");
const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");

let activeGame = null;
let reward = null;
let rewardTimer = null;
let wrongFlash = false;
let wrongTimer = null;
let audioContext = null;
let imageDeck = shuffle(IMAGE_NAMES.map((name) => `assets/images/${name}`));
let imagePosition = 0;

for (const definition of GAME_DEFINITIONS) {
  const button = document.createElement("button");
  button.className = "game-card";
  button.style.background = definition.color;
  button.innerHTML = `<strong>${definition.title}</strong><span>${definition.description}</span>`;
  button.addEventListener("click", () => startGame(definition.id));
  gameList.append(button);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener(
  "keydown",
  (event) => {
    if (!activeGame) return;
    event.preventDefault();
    event.stopPropagation();
    handleKey(event.key);
  },
  { capture: true },
);

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
});

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function nextImage() {
  if (imagePosition >= imageDeck.length) {
    imageDeck = shuffle(imageDeck);
    imagePosition = 0;
  }
  const path = imageDeck[imagePosition];
  imagePosition += 1;
  return path;
}

function resizeCanvas() {
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  render();
}

async function startGame(id) {
  clearTimeout(rewardTimer);
  clearTimeout(wrongTimer);
  reward = null;
  wrongFlash = false;
  activeGame = createGame(id);
  menu.hidden = true;
  gameScreen.hidden = false;
  resizeCanvas();
  canvas.focus();
  try {
    await gameScreen.requestFullscreen?.();
  } catch {
    // Fullscreen may be blocked by browser settings; the game still works.
  }
  if (id === "directions") {
    setTimeout(() => speakDirection(activeGame.state.target), 300);
  }
}

function createGame(id) {
  if (id === "numbers") {
    return { id, state: new NumberGameState() };
  }
  if (id === "add-remove") {
    const [count, target] = randomPair();
    return { id, state: new AddRemoveState(count, target) };
  }
  if (id === "letters") {
    const target = ALLOWED_LETTERS[Math.floor(Math.random() * ALLOWED_LETTERS.length)];
    return { id, state: new LetterState(target) };
  }
  if (id === "maze") {
    return { id, mazeIndex: 0, state: new MazeState(MAZES[0]) };
  }
  if (id === "directions") {
    const target = DIRECTION_KEYS[Math.floor(Math.random() * DIRECTION_KEYS.length)];
    return { id, state: new DirectionState(target) };
  }
  if (id === "flowers") {
    const state = new BeeFlowerState();
    placeFlower(state);
    return { id, state };
  }
  throw new Error(`Unknown game: ${id}`);
}

async function returnToMenu() {
  clearTimeout(rewardTimer);
  clearTimeout(wrongTimer);
  reward = null;
  activeGame = null;
  gameScreen.hidden = true;
  menu.hidden = false;
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch {
      // Browser may already be leaving fullscreen.
    }
  }
}

function handleKey(rawKey) {
  if (!activeGame) return;
  const key = rawKey.length === 1 ? rawKey.toLowerCase() : rawKey;
  const exitKey = activeGame.id === "letters" ? "5" : "q";
  if (key === exitKey) {
    returnToMenu();
    return;
  }
  if (reward) return;

  const result = activeGame.state.input(rawKey.length === 1 ? rawKey : rawKey);
  if (result === "exit") {
    returnToMenu();
  } else if (result === "correct") {
    handleCorrectAnswer();
  } else if (result === "changed" || result === "restart") {
    render();
  } else {
    showWrong();
  }
}

function handleCorrectAnswer() {
  const game = activeGame;
  if (game.id === "letters") {
    playFile(`assets/speech/et/${game.state.target}.wav`);
    setTimeout(playGoodSound, 650);
    showReward(game.state.target, () => {
      const next = randomDifferent(ALLOWED_LETTERS, game.state.target);
      game.state = new LetterState(next);
    });
    return;
  }

  if (game.id === "directions") {
    speakDirection(game.state.target);
    setTimeout(playGoodSound, 700);
    showReward(DIRECTION_INFO[game.state.target].word, () => {
      const next = randomDifferent(DIRECTION_KEYS, game.state.target);
      game.state = new DirectionState(next);
      setTimeout(() => speakDirection(next), 300);
    });
    return;
  }

  if (game.id === "maze") {
    playGoodSound();
    showReward("TUBLI!", () => {
      game.mazeIndex = (game.mazeIndex + 1) % MAZES.length;
      game.state = new MazeState(MAZES[game.mazeIndex]);
    });
    return;
  }

  if (game.id === "flowers") {
    playFile("assets/speech/et/tubli.wav");
    setTimeout(playGoodSound, 700);
    showReward("TUBLI!", () => {
      if (game.state.flowers >= 5) {
        game.state = new BeeFlowerState();
      }
      placeFlower(game.state);
    });
    return;
  }

  playGoodSound();
  showReward("TUBLI!", () => {
    if (game.id === "add-remove") {
      const [count, target] = randomPair();
      game.state = new AddRemoveState(count, target);
    }
  });
}

function showReward(label, afterReward) {
  const image = new Image();
  image.src = nextImage();
  image.addEventListener("load", render, { once: true });
  reward = { label, image, afterReward };
  render();
  clearTimeout(rewardTimer);
  rewardTimer = setTimeout(() => {
    const callback = reward?.afterReward;
    reward = null;
    callback?.();
    render();
  }, 4000);
}

function showWrong() {
  playWrongSound();
  wrongFlash = true;
  render();
  clearTimeout(wrongTimer);
  wrongTimer = setTimeout(() => {
    wrongFlash = false;
    render();
  }, 180);
}

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(frequency, duration, offset = 0, volume = 0.12) {
  const audio = ensureAudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audio.currentTime + offset);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audio.currentTime + offset + duration,
  );
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(audio.currentTime + offset);
  oscillator.stop(audio.currentTime + offset + duration);
}

function playGoodSound() {
  playTone(523.25, 0.18);
  playTone(659.25, 0.18, 0.17);
  playTone(783.99, 0.28, 0.34);
}

function playWrongSound() {
  playTone(180, 0.2, 0, 0.1);
  playTone(135, 0.25, 0.16, 0.08);
}

function playFile(path) {
  const audio = new Audio(path);
  audio.volume = 0.9;
  audio.play().catch(() => {});
}

function speakDirection(key) {
  playFile(`assets/speech/et/${DIRECTION_INFO[key].speech}`);
}

function placeFlower(state) {
  let position = state.flowerX;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    position = 0.1 + Math.random() * 0.8;
    if (Math.abs(position - state.beeX) > 0.28) break;
  }
  state.flowerX = position;
}

function render() {
  if (!activeGame || gameScreen.hidden) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  context.clearRect(0, 0, width, height);

  if (reward) {
    drawReward(width, height);
    return;
  }

  drawBackground(width, height, wrongFlash ? "#ffcdd2" : "#8fddff");
  if (activeGame.id === "numbers") drawNumberGame(width, height);
  if (activeGame.id === "add-remove") drawAddRemove(width, height);
  if (activeGame.id === "letters") drawLetterGame(width, height);
  if (activeGame.id === "maze") drawMazeGame(width, height);
  if (activeGame.id === "directions") drawDirectionGame(width, height);
  if (activeGame.id === "flowers") drawFlowerGame(width, height);
}

function drawBackground(width, height, sky) {
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#72d572";
  context.fillRect(0, height * 0.8, width, height * 0.2);
  const dots = [
    [0.08, 0.15, "#fff176"],
    [0.18, 0.3, "#f48fb1"],
    [0.84, 0.18, "#ce93d8"],
    [0.91, 0.42, "#fff176"],
  ];
  for (const [x, y, color] of dots) {
    circle(width * x, height * y, Math.min(width, height) * 0.02, color, "#fff", 3);
  }
}

function drawNumberGame(width, height) {
  const value = activeGame.state.displayed;
  if (value === "R") {
    drawCard(width / 2, height / 2, Math.min(width, height) * 0.48, "#ab47bc", "R");
    return;
  }
  drawBadge(width / 2, height * 0.14, Math.min(width, height) * 0.19, value);
  drawBlocks(Number(value), width, height, height * 0.16);
}

function drawAddRemove(width, height) {
  drawBadge(
    width / 2,
    height * 0.14,
    Math.min(width, height) * 0.18,
    activeGame.state.target,
  );
  drawBlocks(activeGame.state.count, width, height, height * 0.15);
}

function drawBlocks(count, width, height, verticalOffset = 0) {
  const columns = Math.min(3, count);
  const rows = Math.ceil(count / columns);
  const gapRatio = 0.12;
  const size = Math.min(
    (width * 0.58) / (columns + (columns - 1) * gapRatio),
    (height * 0.5) / (rows + (rows - 1) * gapRatio),
  );
  const gap = size * gapRatio;
  const totalWidth = columns * size + (columns - 1) * gap;
  const totalHeight = rows * size + (rows - 1) * gap;
  const left = (width - totalWidth) / 2;
  const top = (height - totalHeight) / 2 + verticalOffset;
  const color = COLORS[count - 1];

  for (let index = 0; index < count; index += 1) {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const x = left + column * (size + gap);
    const y = top + row * (size + gap);
    roundedRect(x + size * 0.05, y + size * 0.05, size, size, size * 0.08, "#455a64");
    roundedRect(x, y, size, size, size * 0.08, color, "#fff", Math.max(4, size * 0.03));
  }
}

function drawLetterGame(width, height) {
  const size = Math.min(width, height) * 0.56;
  drawCard(width / 2, height * 0.5, size, "#ff8a65", activeGame.state.target);
}

function drawMazeGame(width, height) {
  const { maze, bee, goal } = activeGame.state;
  const rows = maze.length;
  const columns = maze[0].length;
  const size = Math.min((width * 0.68) / columns, (height * 0.8) / rows);
  const left = (width - columns * size) / 2;
  const top = (height - rows * size) / 2;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      context.fillStyle = maze[row][column] === "#" ? "#66bb6a" : "#fffde7";
      context.fillRect(left + column * size, top + row * size, size, size);
      context.strokeStyle = "#fff";
      context.lineWidth = Math.max(1, size * 0.025);
      context.strokeRect(left + column * size, top + row * size, size, size);
    }
  }
  drawFlower(
    left + (goal[1] + 0.5) * size,
    top + (goal[0] + 0.5) * size,
    size * 0.35,
  );
  drawBee(
    left + (bee[1] + 0.5) * size,
    top + (bee[0] + 0.5) * size,
    size * 0.75,
  );
}

function drawDirectionGame(width, height) {
  const info = DIRECTION_INFO[activeGame.state.target];
  text(info.word, width / 2, height * 0.14, Math.min(width, height) * 0.1, "#263238");
  drawArrow(
    width / 2,
    height * 0.53,
    Math.min(width, height) * 0.52,
    activeGame.state.target,
    info.color,
  );
}

function drawFlowerGame(width, height) {
  const state = activeGame.state;
  const laneY = height * 0.56;
  context.strokeStyle = "#fff";
  context.lineWidth = Math.max(5, Math.min(width, height) * 0.012);
  context.setLineDash([18, 14]);
  context.beginPath();
  context.moveTo(width * 0.08, laneY);
  context.lineTo(width * 0.92, laneY);
  context.stroke();
  context.setLineDash([]);

  const startX = width / 2 - Math.min(width, height) * 0.14;
  for (let index = 0; index < 5; index += 1) {
    circle(
      startX + index * Math.min(width, height) * 0.07,
      height * 0.07,
      Math.min(width, height) * 0.021,
      index < state.flowers ? "#ec407a" : "#fff",
      "#ad1457",
      2,
    );
  }
  const left = width * 0.1;
  const span = width * 0.8;
  drawBee(left + state.beeX * span, laneY, Math.min(width, height) * 0.12);
  drawFlower(left + state.flowerX * span, laneY, Math.min(width, height) * 0.085);
}

function drawReward(width, height) {
  context.fillStyle = "#fff59d";
  context.fillRect(0, 0, width, height);
  if (reward.image.complete && reward.image.naturalWidth) {
    const maxWidth = width * 0.82;
    const maxHeight = height * 0.82;
    const scale = Math.min(
      maxWidth / reward.image.naturalWidth,
      maxHeight / reward.image.naturalHeight,
    );
    const imageWidth = reward.image.naturalWidth * scale;
    const imageHeight = reward.image.naturalHeight * scale;
    const x = (width - imageWidth) / 2;
    const y = (height - imageHeight) / 2;
    roundedRect(x - 18, y - 18, imageWidth + 36, imageHeight + 36, 18, "#fff", "#ff8f00", 8);
    context.drawImage(reward.image, x, y, imageWidth, imageHeight);
  } else {
    text("☺", width / 2, height / 2, Math.min(width, height) * 0.5, "#ff8f00");
  }
  if (reward.label) {
    drawBadge(
      width / 2,
      height * 0.11,
      Math.min(width, height) * 0.18,
      reward.label,
    );
  }
}

function drawBadge(x, y, size, label) {
  circle(x, y, size / 2, "#ffca28", "#fff", Math.max(5, size * 0.05));
  const fontSize = label.length > 3 ? size * 0.28 : size * 0.6;
  text(label, x, y, fontSize, "#263238");
}

function drawCard(x, y, size, color, label) {
  roundedRect(x - size / 2 + size * 0.05, y - size / 2 + size * 0.05, size, size, size * 0.08, "#455a64");
  roundedRect(x - size / 2, y - size / 2, size, size, size * 0.08, color, "#fff", Math.max(7, size * 0.035));
  circle(x, y, size * 0.38, "#fff", "#ffca28", Math.max(6, size * 0.025));
  text(label, x, y, size * 0.58, "#263238");
}

function drawArrow(x, y, size, direction, color) {
  const base = [
    [0, -0.48],
    [0.38, -0.1],
    [0.17, -0.1],
    [0.17, 0.42],
    [-0.17, 0.42],
    [-0.17, -0.1],
    [-0.38, -0.1],
  ];
  const rotate = ([px, py]) => {
    if (direction === "8") return [px, py];
    if (direction === "2") return [-px, -py];
    if (direction === "4") return [py, -px];
    return [-py, px];
  };
  const points = base.map(rotate).map(([px, py]) => [x + px * size, y + py * size]);
  context.beginPath();
  points.forEach(([px, py], index) => {
    if (index === 0) context.moveTo(px, py);
    else context.lineTo(px, py);
  });
  context.closePath();
  context.fillStyle = color;
  context.fill();
  context.strokeStyle = "#fff";
  context.lineWidth = Math.max(7, size * 0.025);
  context.stroke();
  circle(x, y, size * 0.13, "#fff59d", "#ff8f00", 4);
  drawFace(x, y, size * 0.13);
}

function drawBee(x, y, size) {
  ellipse(x - size * 0.17, y - size * 0.28, size * 0.2, size * 0.24, "#e1f5fe", "#42a5f5", 2);
  ellipse(x + size * 0.17, y - size * 0.28, size * 0.2, size * 0.24, "#e1f5fe", "#42a5f5", 2);
  ellipse(x, y, size * 0.7, size * 0.52, "#ffca28", "#263238", Math.max(3, size * 0.035));
  context.strokeStyle = "#263238";
  context.lineWidth = Math.max(4, size * 0.075);
  for (const offset of [-0.12, 0.1]) {
    context.beginPath();
    context.moveTo(x + size * offset, y - size * 0.22);
    context.lineTo(x + size * offset, y + size * 0.22);
    context.stroke();
  }
  drawFace(x, y, size * 0.28);
}

function drawFlower(x, y, radius) {
  for (let angle = 0; angle < 360; angle += 60) {
    const radians = (angle * Math.PI) / 180;
    circle(
      x + Math.cos(radians) * radius * 0.62,
      y + Math.sin(radians) * radius * 0.62,
      radius * 0.48,
      "#ec407a",
      "#fff",
      Math.max(2, radius * 0.07),
    );
  }
  circle(x, y, radius * 0.48, "#ffca28", "#ff8f00", Math.max(3, radius * 0.08));
}

function drawFace(x, y, radius) {
  circle(x - radius * 0.35, y - radius * 0.2, radius * 0.12, "#263238");
  circle(x + radius * 0.35, y - radius * 0.2, radius * 0.12, "#263238");
  context.beginPath();
  context.arc(x, y + radius * 0.05, radius * 0.45, 0.15 * Math.PI, 0.85 * Math.PI);
  context.strokeStyle = "#263238";
  context.lineWidth = Math.max(2, radius * 0.1);
  context.stroke();
}

function roundedRect(x, y, width, height, radius, fill, stroke, lineWidth = 0) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
  if (stroke && lineWidth) {
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.stroke();
  }
}

function circle(x, y, radius, fill, stroke, lineWidth = 0) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
  if (stroke && lineWidth) {
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.stroke();
  }
}

function ellipse(x, y, width, height, fill, stroke, lineWidth = 0) {
  context.beginPath();
  context.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
  if (stroke && lineWidth) {
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.stroke();
  }
}

function text(value, x, y, size, color) {
  context.save();
  context.fillStyle = color;
  context.font = `900 ${Math.max(18, size)}px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(value), x, y);
  context.restore();
}

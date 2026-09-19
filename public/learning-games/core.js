export const NUMBER_SEQUENCE = [1, 4, 2, 8, 5, 7, 3, 9, 6];
export const ALLOWED_LETTERS = [..."KAUIMJOHNES"];
export const READING_SYLLABLES = [
  "JA",
  "JO",
  "KA",
  "KE",
  "KI",
  "KO",
  "KU",
  "MA",
  "ME",
  "MI",
  "MO",
  "MU",
  "NA",
  "NE",
  "NI",
  "NO",
  "NU",
  "SA",
  "SE",
  "SI",
  "SO",
  "SU",
];
export const SHORT_READING_WORDS = [
  "EI",
  "HEA",
  "ISA",
  "JA",
  "JAH",
  "MA",
  "OMA",
  "SAI",
  "UNI",
];
export const LONG_READING_WORDS = [
  "JOON",
  "KAKA",
  "KANA",
  "KASS",
  "MAJA",
  "MINA",
  "MUNA",
  "NIMI",
  "NINA",
  "SAMA",
  "SINA",
];
export const LETTER_WORDS = [...SHORT_READING_WORDS, ...LONG_READING_WORDS];
export const PICTURE_WORDS = ["KANA", "KASS", "MAJA", "MUNA", "NINA"];
export const DIRECTION_KEYS = ["8", "2", "4", "6"];

export const MAZES = [
  [
    "#########",
    "#S#.....#",
    "#.#.###.#",
    "#.#...#.#",
    "#.###.#.#",
    "#.....#.#",
    "#####.#.#",
    "#......G#",
    "#########",
  ],
  [
    "#########",
    "#S......#",
    "#######.#",
    "#.......#",
    "#.#######",
    "#.......#",
    "#######.#",
    "#......G#",
    "#########",
  ],
  [
    "#########",
    "#......S#",
    "#.#######",
    "#.......#",
    "#######.#",
    "#.......#",
    "#.#######",
    "#G......#",
    "#########",
  ],
  [
    "#########",
    "#S#.....#",
    "#.#.###.#",
    "#.#.#...#",
    "#.#.#.###",
    "#...#...#",
    "#.#####.#",
    "#......G#",
    "#########",
  ],
];

export function randomDifferent(values, previous, random = Math.random) {
  const choices = values.filter((value) => value !== previous);
  return choices[Math.floor(random() * choices.length)];
}

export function randomPair(min = 1, max = 9, random = Math.random) {
  const first = min + Math.floor(random() * (max - min + 1));
  let second = first;
  while (second === first) {
    second = min + Math.floor(random() * (max - min + 1));
  }
  return [first, second];
}

export function normalizeDirectionKey(key) {
  return {
    ArrowUp: "8",
    ArrowDown: "2",
    ArrowLeft: "4",
    ArrowRight: "6",
  }[key] ?? key;
}

function randomItem(values, random = Math.random) {
  return values[Math.floor(random() * values.length)];
}

function pickReadingValue(values, mistakes, previous, random = Math.random) {
  const weakLetter = Object.entries(mistakes)
    .filter(([letter, count]) => ALLOWED_LETTERS.includes(letter) && count > 0)
    .sort((first, second) => second[1] - first[1])[0]?.[0];
  const weakChoices = weakLetter
    ? values.filter((value) => value.includes(weakLetter) && value !== previous)
    : [];
  const regularChoices = values.filter((value) => value !== previous);
  if (weakChoices.length > 0 && random() < 0.5) {
    return randomItem(weakChoices, random);
  }
  return randomItem(regularChoices.length > 0 ? regularChoices : values, random);
}

function shuffleWithRandom(values, random = Math.random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function createReadingPrompt(
  level,
  mistakes = {},
  previous = "",
  random = Math.random,
) {
  if (level === 1) {
    return {
      type: "letter",
      target: pickReadingValue(ALLOWED_LETTERS, mistakes, previous, random),
    };
  }
  if (level === 2) {
    return {
      type: "syllable",
      target: pickReadingValue(READING_SYLLABLES, mistakes, previous, random),
    };
  }
  if (level === 3) {
    return {
      type: "word",
      target: pickReadingValue(SHORT_READING_WORDS, mistakes, previous, random),
    };
  }
  if (level === 4) {
    return {
      type: "word",
      target: pickReadingValue(LONG_READING_WORDS, mistakes, previous, random),
    };
  }
  if (level === 5) {
    const target = pickReadingValue(LONG_READING_WORDS, mistakes, previous, random);
    const hiddenIndex = Math.floor(random() * target.length);
    return {
      type: "missing",
      target,
      hiddenIndex,
      answer: target[hiddenIndex],
    };
  }

  const target = pickReadingValue(PICTURE_WORDS, mistakes, previous, random);
  const distractors = shuffleWithRandom(
    PICTURE_WORDS.filter((word) => word !== target),
    random,
  ).slice(0, 2);
  const choices = shuffleWithRandom([target, ...distractors], random);
  return {
    type: "picture",
    target,
    choices,
    correctIndex: choices.indexOf(target),
  };
}

export class NumberGameState {
  constructor(sequence = NUMBER_SEQUENCE) {
    this.sequence = [...sequence];
    this.position = 0;
  }

  get complete() {
    return this.position >= this.sequence.length;
  }

  get displayed() {
    return this.complete ? "R" : String(this.sequence[this.position]);
  }

  input(key) {
    if (key?.toLowerCase() === "q") return "exit";
    if (this.complete) {
      if (key?.toLowerCase() === "r") {
        this.position = 0;
        return "restart";
      }
      return "wrong";
    }
    if (key === this.displayed) {
      this.position += 1;
      return "correct";
    }
    return "wrong";
  }
}

export class AddRemoveState {
  constructor(count, target) {
    if (count === target) throw new Error("Starting count and target differ.");
    this.count = count;
    this.target = target;
  }

  input(key) {
    if (key?.toLowerCase() === "q") return "exit";
    if (key === "8" && this.count < 9) this.count += 1;
    else if (key === "2" && this.count > 1) this.count -= 1;
    else return "wrong";
    return this.count === this.target ? "correct" : "changed";
  }
}

export class ReadingGameState {
  constructor({
    level = 1,
    correctInLevel = 0,
    mistakes = {},
    prompt,
    random = Math.random,
  } = {}) {
    this.level = Math.min(6, Math.max(1, level));
    this.correctInLevel = Math.min(4, Math.max(0, correctInLevel));
    this.mistakes = { ...mistakes };
    this.random = random;
    this.prompt = prompt ?? createReadingPrompt(
      this.level,
      this.mistakes,
      "",
      this.random,
    );
    this.position = 0;
  }

  get complete() {
    return this.prompt.type === "picture"
      ? false
      : this.position >= this.prompt.target.length;
  }

  get typed() {
    return this.prompt.target.slice(0, this.position);
  }

  get expected() {
    if (this.prompt.type === "picture") {
      return String(this.prompt.correctIndex + 1);
    }
    if (this.prompt.type === "missing") {
      return this.prompt.answer;
    }
    return this.prompt.target[this.position];
  }

  recordMistake() {
    const key = this.expected ?? this.prompt.target;
    this.mistakes[key] = (this.mistakes[key] ?? 0) + 1;
  }

  input(key) {
    if (key === "5") return "exit";
    if (this.prompt.type === "picture") {
      if (!["1", "2", "3"].includes(key)) {
        this.recordMistake();
        return "wrong";
      }
      if (Number(key) - 1 !== this.prompt.correctIndex) {
        this.recordMistake();
        return "wrong";
      }
      return "correct";
    }

    const letter = key?.toUpperCase();
    if (!ALLOWED_LETTERS.includes(letter) || letter !== this.expected) {
      this.recordMistake();
      return "wrong";
    }
    if (this.prompt.type === "missing") {
      this.position = this.prompt.target.length;
      return "correct";
    }
    this.position += 1;
    return this.complete ? "correct" : "changed";
  }

  advance() {
    const previous = this.prompt.target;
    this.correctInLevel += 1;
    if (this.correctInLevel >= 5) {
      this.correctInLevel = 0;
      this.level = Math.min(6, this.level + 1);
    }
    this.prompt = createReadingPrompt(
      this.level,
      this.mistakes,
      previous,
      this.random,
    );
    this.position = 0;
  }

  progress() {
    return {
      level: this.level,
      correctInLevel: this.correctInLevel,
      mistakes: this.mistakes,
    };
  }
}

export class MazeState {
  constructor(maze) {
    this.maze = maze;
    this.bee = this.find("S");
    this.goal = this.find("G");
  }

  find(value) {
    for (let row = 0; row < this.maze.length; row += 1) {
      const column = this.maze[row].indexOf(value);
      if (column >= 0) return [row, column];
    }
    throw new Error(`Missing maze cell: ${value}`);
  }

  input(rawKey) {
    const key = normalizeDirectionKey(rawKey);
    if (key?.toLowerCase() === "q") return "exit";
    const changes = {
      8: [-1, 0],
      2: [1, 0],
      4: [0, -1],
      6: [0, 1],
    };
    if (!changes[key]) return "wrong";
    const next = [
      this.bee[0] + changes[key][0],
      this.bee[1] + changes[key][1],
    ];
    if (this.maze[next[0]]?.[next[1]] === "#" || !this.maze[next[0]]?.[next[1]]) {
      return "wrong";
    }
    this.bee = next;
    return this.bee[0] === this.goal[0] && this.bee[1] === this.goal[1]
      ? "correct"
      : "changed";
  }
}

export class DirectionState {
  constructor(target) {
    this.target = target;
  }

  input(rawKey) {
    const key = normalizeDirectionKey(rawKey);
    if (key?.toLowerCase() === "q") return "exit";
    return key === this.target ? "correct" : "wrong";
  }
}

export class BeeFlowerState {
  constructor(beeX = 0.5, flowerX = 0.75) {
    this.beeX = beeX;
    this.flowerX = flowerX;
    this.flowers = 0;
  }

  input(rawKey) {
    const key = normalizeDirectionKey(rawKey);
    if (key?.toLowerCase() === "q") return "exit";
    const change = { 4: -0.06, 6: 0.06 }[key];
    if (!change) return "wrong";
    const next = Math.min(1, Math.max(0, this.beeX + change));
    if (next === this.beeX) return "wrong";
    this.beeX = next;
    if (Math.abs(this.beeX - this.flowerX) <= 0.095) {
      this.flowers += 1;
      return "correct";
    }
    return "changed";
  }
}

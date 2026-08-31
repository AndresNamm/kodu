export const NUMBER_SEQUENCE = [1, 4, 2, 8, 5, 7, 3, 9, 6];
export const ALLOWED_LETTERS = [..."AKXSUIO"];
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

export class LetterState {
  constructor(target) {
    if (!ALLOWED_LETTERS.includes(target)) throw new Error("Invalid letter.");
    this.target = target;
  }

  input(key) {
    if (key === "5") return "exit";
    return key?.toUpperCase() === this.target ? "correct" : "wrong";
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

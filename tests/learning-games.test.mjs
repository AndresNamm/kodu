import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AddRemoveState,
  ALLOWED_LETTERS,
  BeeFlowerState,
  createReadingPrompt,
  DirectionState,
  LETTER_WORDS,
  MAZES,
  MazeState,
  NumberGameState,
  PICTURE_WORDS,
  ReadingGameState,
  READING_SYLLABLES,
  normalizeDirectionKey
} from '../public/learning-games/core.js';

test('number game advances and restarts', () => {
  const state = new NumberGameState([1]);
  assert.equal(state.input('2'), 'wrong');
  assert.equal(state.input('1'), 'correct');
  assert.equal(state.displayed, 'R');
  assert.equal(state.input('r'), 'restart');
  assert.equal(state.displayed, '1');
});

test('add and remove game completes automatically', () => {
  assert.equal(new AddRemoveState(4, 5).input('8'), 'correct');
  assert.equal(new AddRemoveState(6, 5).input('2'), 'correct');
});

test('reading game only supports the beginner letter set', () => {
  assert.deepEqual(ALLOWED_LETTERS, ['K', 'A', 'U', 'I', 'M', 'J', 'O', 'H', 'N', 'E', 'S']);
  for (const letter of ALLOWED_LETTERS) {
    const state = new ReadingGameState({
      prompt: { type: 'letter', target: letter }
    });
    assert.equal(state.input(letter.toLowerCase()), 'correct');
  }
});

test('reading game accepts words letter by letter', () => {
  const state = new ReadingGameState({
    level: 4,
    prompt: { type: 'word', target: 'KAKA' }
  });
  assert.equal(state.input('k'), 'changed');
  assert.equal(state.typed, 'K');
  assert.equal(state.input('x'), 'wrong');
  assert.equal(state.typed, 'K');
  assert.equal(state.input('a'), 'changed');
  assert.equal(state.input('k'), 'changed');
  assert.equal(state.input('a'), 'correct');
  assert.equal(state.complete, true);
});

test('all learning words use allowed letters and are at most four letters', () => {
  for (const word of [...READING_SYLLABLES, ...LETTER_WORDS]) {
    assert.ok(word.length >= 2 && word.length <= 4);
    assert.ok([...word].every((letter) => ALLOWED_LETTERS.includes(letter)));
  }
});

test('reading game advances a level after five correct prompts', () => {
  const state = new ReadingGameState({
    level: 1,
    correctInLevel: 4,
    prompt: { type: 'letter', target: 'A' },
    random: () => 0
  });
  assert.equal(state.input('a'), 'correct');
  state.advance();
  assert.equal(state.level, 2);
  assert.equal(state.correctInLevel, 0);
  assert.equal(state.prompt.type, 'syllable');
});

test('missing-letter prompt accepts only the hidden letter', () => {
  const state = new ReadingGameState({
    level: 5,
    prompt: {
      type: 'missing',
      target: 'KASS',
      hiddenIndex: 1,
      answer: 'A'
    }
  });
  assert.equal(state.input('s'), 'wrong');
  assert.equal(state.input('a'), 'correct');
});

test('picture prompt accepts only the matching numbered picture', () => {
  const state = new ReadingGameState({
    level: 6,
    prompt: {
      type: 'picture',
      target: 'KASS',
      choices: ['MAJA', 'KASS', 'MUNA'],
      correctIndex: 1
    }
  });
  assert.equal(state.input('1'), 'wrong');
  assert.equal(state.input('2'), 'correct');
});

test('picture prompts contain three distinct supported picture words', () => {
  const prompt = createReadingPrompt(6, {}, '', () => 0.25);
  assert.equal(prompt.type, 'picture');
  assert.equal(new Set(prompt.choices).size, 3);
  assert.ok(prompt.choices.every((word) => PICTURE_WORDS.includes(word)));
  assert.equal(prompt.choices[prompt.correctIndex], prompt.target);
});

test('arrow keys map to number directions', () => {
  assert.equal(normalizeDirectionKey('ArrowUp'), '8');
  assert.equal(normalizeDirectionKey('ArrowDown'), '2');
  assert.equal(normalizeDirectionKey('ArrowLeft'), '4');
  assert.equal(normalizeDirectionKey('ArrowRight'), '6');
});

test('all labyrinths contain distinct bee and goal positions', () => {
  for (const maze of MAZES) {
    const state = new MazeState(maze);
    assert.notDeepEqual(state.bee, state.goal);
  }
});

test('direction game accepts the matching arrow', () => {
  assert.equal(new DirectionState('4').input('ArrowLeft'), 'correct');
});

test('bee and flower game moves horizontally and reaches a flower', () => {
  const state = new BeeFlowerState(0.5, 0.56);
  assert.equal(state.input('ArrowRight'), 'correct');
  assert.equal(state.flowers, 1);
  assert.equal(state.input('ArrowUp'), 'wrong');
});

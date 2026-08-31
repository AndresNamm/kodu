import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AddRemoveState,
  ALLOWED_LETTERS,
  BeeFlowerState,
  DirectionState,
  LetterState,
  MAZES,
  MazeState,
  NumberGameState,
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

test('letter game only supports the beginner set', () => {
  for (const letter of ALLOWED_LETTERS) {
    assert.equal(new LetterState(letter).input(letter.toLowerCase()), 'correct');
  }
  assert.throws(() => new LetterState('B'));
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

import {
  BattleShipColIndex,
  BattleShipColor,
  BattleShipPiece,
  BattleShipRowIndex,
} from '../../types/CoveyTownSocket';
import BattleShipGame from './BattleShipGame';
import { createPlayerForTesting } from '../../TestUtils';
import {
  BOARD_POSITION_NOT_VALID_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';

const GAME_NOT_WAITING_TO_START_MESSAGE = 'Game is not in waiting to start mode';
const NOT_YOUR_BOARD_MESSAGE = 'Not your board';
const MAX_BOAT_PIECES = 18;

/**
 * A helper function to apply a placement of moves to a game.
 * The pattern is a 2-d array of F, M, E, or _.
 * F, M, and E indicate a placement of a front, middle, or end piece that has been
 * placed on the board by a player with a blue or green board respectively.
 * _ indicates that no placement has been made in this position.
 * The pattern is applied from the bottom left to the top right, going across the rows
 *
 * If the method fails, it will print to the console the pattern and the moves that were
 * made, and throw an error.
 *
 * @param game Game to apply the pattern to
 * @param boardColor Color of board to apply pattern to
 * @param pattern Board pattern to apply
 * @param blueID ID of player with blue board
 * @param greenID ID of green player
 */
function createBoatPlacementsFromPattern(
  game: BattleShipGame,
  boardColor: BattleShipColor,
  pattern: string[][],
  blueID: string,
  greenID: string,
) {
  type QueuedPlacement = {
    boat: BattleShipPiece;
    rowIdx: BattleShipRowIndex;
    colIdx: BattleShipColIndex;
  };
  const queues = {
    Board: [] as QueuedPlacement[],
  };

  // Construct the queues of moves to make from the board pattern
  pattern.forEach((row, rowIdx) => {
    row.forEach((col, colIdx) => {
      if (col === 'F') {
        queues.Board.push({
          boat: 'Front' as BattleShipPiece,
          rowIdx: rowIdx as BattleShipRowIndex,
          colIdx: colIdx as BattleShipColIndex,
        });
      } else if (col === 'M') {
        queues.Board.push({
          boat: 'Middle' as BattleShipPiece,
          rowIdx: rowIdx as BattleShipRowIndex,
          colIdx: colIdx as BattleShipColIndex,
        });
      } else if (col === 'E') {
        queues.Board.push({
          boat: 'End' as BattleShipPiece,
          rowIdx: rowIdx as BattleShipRowIndex,
          colIdx: colIdx as BattleShipColIndex,
        });
      } else if (col !== '_') {
        throw new Error(`Invalid pattern: ${pattern}, expecting 2-d array of F, M, E, or _`);
      }
    });
  });

  const queue = queues.Board;
  if (queue.length === 0) return;
  for (const move of queue) {
    game.placeBoat({
      gameID: game.id,
      move: {
        boardColor,
        boat: move.boat,
        col: move.colIdx,
        row: move.rowIdx,
      },
      playerID: boardColor === 'Blue' ? blueID : greenID,
    });
    queues.Board = queue.filter(m => m !== move);
  }
}

describe('BattleShipGame', () => {
  let game: BattleShipGame;
  beforeEach(() => {
    game = new BattleShipGame();
  });
  describe('_startGame', () => {
    test('if the status is not WAITING_TO_START, it throws an error', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.startGame(player)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
    });
    test('if the player is not in the game, it throws an error', () => {
      game.join(createPlayerForTesting());
      game.join(createPlayerForTesting());
      expect(() => game.startGame(createPlayerForTesting())).toThrowError(
        PLAYER_NOT_IN_GAME_MESSAGE,
      );
    });
    test('if no boat pieces in blue board when blue starts game, it throws an error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      expect(game.state.status).toBe('WAITING_TO_START');
      expect(() => game.startGame(blue)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
    });
    test('if no boat pieces in blue board when green starts game, it throws an error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      expect(game.state.status).toBe('WAITING_TO_START');
      expect(() => game.startGame(green)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
    });
    test('if blue board has incorrect horizontal boats, it throws an error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      createBoatPlacementsFromPattern(
        game,
        'Blue',
        [
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
          ['_', 'F', 'M', 'M', 'M', '_', 'E', '_', '_', 'M'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'E'],
          ['_', '_', '_', '_', '_', '_', '_', 'F', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
          ['_', 'E', 'M', 'M', 'M', 'F', '_', 'M', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'E', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
        ],
        blue.id,
        green.id,
      );
      expect(() => game.startGame(blue)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
    });
    test('if green board has incorrect horizontal boats, it throws an error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      createBoatPlacementsFromPattern(
        game,
        'Green',
        [
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
          ['E', 'M', 'F', 'F', 'E', 'F', '_', '_', '_', 'M'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'E'],
          ['_', '_', '_', '_', '_', '_', '_', 'F', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
          ['_', 'F', 'M', 'M', 'E', '_', '_', 'M', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'E', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
        ],
        blue.id,
        green.id,
      );
      expect(game.state.greenBoard.length).toBe(18);
      expect(() => game.startGame(green)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
    });
    test('if a horizontal and vertical boat invalidly intersect, should throw error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      createBoatPlacementsFromPattern(
        game,
        'Blue',
        [
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'E'],
          ['_', 'F', 'M', 'M', 'M', 'E', '_', '_', '_', 'M'],
          ['_', '_', '_', '_', '_', '_', '_', '_', 'F', 'F'],
          ['_', '_', '_', '_', '_', '_', '_', 'F', 'M', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'M', 'E', '_'],
          ['_', 'F', 'M', 'M', 'M', '_', '_', 'E', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
        ],
        blue.id,
        green.id,
      );

      expect(() => game.startGame(blue)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
    });
    test('if a horizontal and vertical boat intersect, it should not throw an error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      createBoatPlacementsFromPattern(
        game,
        'Blue',
        [
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
          ['_', 'F', 'M', 'M', 'M', 'E', '_', '_', '_', 'M'],
          ['_', '_', '_', '_', '_', '_', '_', '_', 'F', 'E'],
          ['_', '_', '_', '_', '_', '_', '_', 'F', 'E', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
          ['_', 'F', 'M', 'M', 'M', 'E', '_', 'E', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
        ],
        blue.id,
        green.id,
      );
      game.startGame(blue);
      expect(game.state.blueReady).toBe(true);
      expect(game.state.greenReady).toBeFalsy();
      expect(game.state.status).toBe('WAITING_TO_START');
    });
    test('if blue board has incorrect vertical boats, it throws an error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      createBoatPlacementsFromPattern(
        game,
        'Blue',
        [
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'E'],
          ['_', 'F', 'M', 'M', 'M', 'E', '_', '_', '_', 'M'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
          ['_', '_', '_', '_', '_', '_', '_', 'E', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
          ['_', 'F', 'M', 'M', 'M', 'E', '_', 'M', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'E', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
        ],
        blue.id,
        green.id,
      );
      expect(() => game.startGame(blue)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
    });
    test('if green board has incorrect vertical boats, it throws an error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      createBoatPlacementsFromPattern(
        game,
        'Green',
        [
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
          ['_', 'F', 'M', 'E', 'F', 'E', '_', '_', '_', 'M'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'M'],
          ['_', '_', '_', '_', '_', '_', '_', 'F', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'M', '_', 'E'],
          ['_', 'F', 'M', 'M', 'M', 'E', '_', 'M', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'E', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
        ],
        blue.id,
        green.id,
      );
      expect(() => game.startGame(green)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
    });
    describe('if the player is in the game', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      beforeEach(() => {
        game.join(blue);
        game.join(green);
        createBoatPlacementsFromPattern(
          game,
          'Blue',
          [
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
            ['_', 'F', 'M', 'M', 'M', 'E', '_', '_', '_', 'M'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'E'],
            ['_', '_', '_', '_', '_', '_', '_', 'F', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
            ['_', 'F', 'M', 'M', 'M', 'E', '_', 'M', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'E', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ],
          blue.id,
          green.id,
        );
        createBoatPlacementsFromPattern(
          game,
          'Green',
          [
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
            ['_', 'F', 'M', 'E', '_', 'F', 'E', '_', '_', 'M'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'E'],
            ['_', '_', '_', '_', '_', '_', '_', 'F', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
            ['_', 'F', 'M', 'M', 'M', 'E', '_', 'M', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'E', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ],
          blue.id,
          green.id,
        );
      });
      test('if the player is blue, it sets blueReady to true', () => {
        game.startGame(blue);
        expect(game.state.blueReady).toBe(true);
        expect(game.state.greenReady).toBeFalsy();
        expect(game.state.status).toBe('WAITING_TO_START');
      });
      test('if the player is green, it sets greenReady to true', () => {
        game.startGame(green);
        expect(game.state.blueReady).toBeFalsy();
        expect(game.state.greenReady).toBe(true);
        expect(game.state.status).toBe('WAITING_TO_START');
      });
      test('if both players are ready, it sets the status to IN_PROGRESS', () => {
        game.startGame(blue);
        game.startGame(green);
        expect(game.state.blueReady).toBe(true);
        expect(game.state.greenReady).toBe(true);
        expect(game.state.status).toBe('IN_PROGRESS');
      });
      test('if a player already reported ready, it does not change the status or throw an error', () => {
        game.startGame(blue);
        game.startGame(blue);
        expect(game.state.blueReady).toBe(true);
        expect(game.state.greenReady).toBeFalsy();
        expect(game.state.status).toBe('WAITING_TO_START');
      });
    });
  });
  describe('removeBoat', () => {
    const blue = createPlayerForTesting();
    const green = createPlayerForTesting();
    beforeEach(() => {
      game.join(blue);
      game.join(green);
    });
    describe('when given a valid removal', () => {
      it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])(
        'should remove boat placement from the game state in row/column %d and not throw an error for green board',
        (idx: number) => {
          game.placeBoat({
            gameID: game.id,
            playerID: green.id,
            move: {
              boardColor: 'Green',
              boat: 'Front',
              col: idx as BattleShipColIndex,
              row: idx as BattleShipRowIndex,
            },
          });
          game.removeBoat({
            gameID: game.id,
            playerID: green.id,
            move: {
              boardColor: 'Green',
              boat: 'Front',
              col: idx as BattleShipColIndex,
              row: idx as BattleShipRowIndex,
            },
          });
          expect(game.state.greenBoard.length).toEqual(0);
        },
      );
      it('should remove boat placement from the game state in row 0 col 1 and not throw an error for blue board', () => {
        game.placeBoat({
          gameID: game.id,
          playerID: blue.id,
          move: { boardColor: 'Blue', boat: 'Middle', col: 0, row: 1 },
        });
        game.removeBoat({
          gameID: game.id,
          playerID: blue.id,
          move: { boardColor: 'Blue', boat: 'Middle', col: 0, row: 1 },
        });
        expect(game.state.blueBoard.length).toEqual(0);
      });
      it.each(['Front' as BattleShipPiece, 'Middle' as BattleShipPiece, 'End' as BattleShipPiece])(
        'should remove piece regardless of given boat type for removal for blue board',
        (boatType: BattleShipPiece) => {
          game.placeBoat({
            gameID: game.id,
            playerID: blue.id,
            move: {
              boardColor: 'Blue',
              boat: 'End',
              col: 0,
              row: 0,
            },
          });
          game.removeBoat({
            gameID: game.id,
            playerID: blue.id,
            move: {
              boardColor: 'Blue',
              boat: boatType,
              col: 0,
              row: 0,
            },
          });
          expect(game.state.blueBoard.length).toEqual(0);
        },
      );
      it.each(['Front' as BattleShipPiece, 'Middle' as BattleShipPiece, 'End' as BattleShipPiece])(
        'should remove piece regardless of given boat type for removal for green board',
        (boatType: BattleShipPiece) => {
          game.placeBoat({
            gameID: game.id,
            playerID: green.id,
            move: {
              boardColor: 'Green',
              boat: 'End',
              col: 0,
              row: 0,
            },
          });
          game.removeBoat({
            gameID: game.id,
            playerID: green.id,
            move: {
              boardColor: 'Green',
              boat: boatType,
              col: 0,
              row: 0,
            },
          });
          expect(game.state.greenBoard.length).toEqual(0);
        },
      );
      it('should not throw an error if there is no boat in the requested removal space', () => {
        game.removeBoat({
          gameID: game.id,
          playerID: blue.id,
          move: { boardColor: 'Blue', boat: 'Middle', col: 0, row: 0 },
        });
        expect(game.state.blueBoard.length).toEqual(0);
      });
    });
  });
  describe('when given an invlaid removal request', () => {
    it('should throw an error if the game is not waiting to start', () => {
      const player = createPlayerForTesting();
      game.join(player);

      expect(() =>
        game.removeBoat({
          gameID: game.id,
          playerID: player.id,
          move: { boardColor: 'Blue', boat: 'End', col: 0, row: 0 },
        }),
      ).toThrowError(GAME_NOT_WAITING_TO_START_MESSAGE);
    });
    it('should throw an error if the player is not in game', () => {
      const player = createPlayerForTesting();
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);

      expect(() =>
        game.removeBoat({
          gameID: game.id,
          playerID: player.id,
          move: { boardColor: 'Blue', boat: 'End', col: 0, row: 0 },
        }),
      ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    it('should throw an error if blue tries to remove a piece on the green board', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);

      expect(() =>
        game.removeBoat({
          gameID: game.id,
          playerID: blue.id,
          move: { boardColor: 'Green', boat: 'End', col: 0, row: 0 },
        }),
      ).toThrowError(NOT_YOUR_BOARD_MESSAGE);
    });
    it('should throw an error if green tries to remove a piece on the blue board', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);

      expect(() =>
        game.removeBoat({
          gameID: game.id,
          playerID: green.id,
          move: { boardColor: 'Blue', boat: 'End', col: 0, row: 0 },
        }),
      ).toThrowError(NOT_YOUR_BOARD_MESSAGE);
    });
  });
  describe('placeBoat', () => {
    const blue = createPlayerForTesting();
    const green = createPlayerForTesting();
    beforeEach(() => {
      game.join(blue);
      game.join(green);
    });
    describe('when given a valid move', () => {
      it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])(
        'should add boat placement to the game state in row/column %d and not throw an error',
        (idx: number) => {
          game.placeBoat({
            gameID: game.id,
            playerID: blue.id,
            move: {
              boardColor: 'Blue',
              boat: 'End',
              col: idx as BattleShipColIndex,
              row: idx as BattleShipRowIndex,
            },
          });
          expect(game.state.blueBoard[0]).toEqual({
            boardColor: 'Blue',
            boat: 'End',
            col: idx as BattleShipRowIndex,
            row: idx as BattleShipColIndex,
          });
        },
      );
      it('should place a boat piece in row 0 column 0 for green board without error', () => {
        game.placeBoat({
          gameID: game.id,
          playerID: green.id,
          move: {
            boardColor: 'Green',
            boat: 'Middle',
            col: 0,
            row: 0,
          },
        });
        expect(game.state.greenBoard[0]).toEqual({
          boardColor: 'Green',
          boat: 'Middle',
          col: 0,
          row: 0,
        });
      });
      it('should place max boat pieces in game state without throwing an error for blue board', () => {
        createBoatPlacementsFromPattern(
          game,
          'Blue',
          [
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
            ['_', 'F', 'M', 'M', 'M', 'E', '_', '_', '_', 'M'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'E'],
            ['_', '_', '_', '_', '_', '_', '_', 'F', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
            ['_', 'F', 'M', 'M', 'M', 'E', '_', 'M', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'E', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ],
          blue.id,
          green.id,
        );
        expect(game.state.blueBoard.length).toEqual(MAX_BOAT_PIECES);
      });
      it('should place max boat pieces in game state without throwing an error for green board', () => {
        createBoatPlacementsFromPattern(
          game,
          'Green',
          [
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
            ['_', 'F', 'M', 'M', 'M', 'E', '_', '_', '_', 'M'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'E'],
            ['_', '_', '_', '_', '_', '_', '_', 'F', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
            ['_', 'F', 'M', 'M', 'M', 'E', '_', 'M', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'E', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ],
          blue.id,
          green.id,
        );
        expect(game.state.greenBoard.length).toEqual(MAX_BOAT_PIECES);
      });
    });
  });
  describe('when given an invlaid placement request', () => {
    it('should throw an error if the game is not waiting to start', () => {
      const player = createPlayerForTesting();
      game.join(player);

      expect(() =>
        game.placeBoat({
          gameID: game.id,
          playerID: player.id,
          move: { boardColor: 'Blue', boat: 'End', col: 0, row: 0 },
        }),
      ).toThrowError(GAME_NOT_WAITING_TO_START_MESSAGE);
    });
    it('should throw an error if the player is not in game', () => {
      const player = createPlayerForTesting();
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);

      expect(() =>
        game.placeBoat({
          gameID: game.id,
          playerID: player.id,
          move: { boardColor: 'Blue', boat: 'End', col: 0, row: 0 },
        }),
      ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    it('should throw an error if blue tries to place a piece on the green board', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);

      expect(() =>
        game.placeBoat({
          gameID: game.id,
          playerID: blue.id,
          move: { boardColor: 'Green', boat: 'End', col: 0, row: 0 },
        }),
      ).toThrowError(NOT_YOUR_BOARD_MESSAGE);
    });
    it('should throw an error if green tries to place a piece on the blue board', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);

      expect(() =>
        game.placeBoat({
          gameID: game.id,
          playerID: green.id,
          move: { boardColor: 'Blue', boat: 'End', col: 0, row: 0 },
        }),
      ).toThrowError(NOT_YOUR_BOARD_MESSAGE);
    });
    it('should throw an error if there is already a piece in the given position', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);

      game.placeBoat({
        gameID: game.id,
        playerID: blue.id,
        move: { boardColor: 'Blue', boat: 'End', col: 0, row: 0 },
      });
      expect(() =>
        game.placeBoat({
          gameID: game.id,
          playerID: blue.id,
          move: { boardColor: 'Blue', boat: 'End', col: 0, row: 0 },
        }),
      ).toThrowError(BOARD_POSITION_NOT_VALID_MESSAGE);
    });
    it('should throw an error if max number of boats have been placed on the board', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);

      createBoatPlacementsFromPattern(
        game,
        'Blue',
        [
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
          ['_', 'F', 'M', 'M', 'M', 'E', '_', '_', '_', 'M'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'E'],
          ['_', '_', '_', '_', '_', '_', '_', 'F', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
          ['_', 'F', 'M', 'M', 'M', 'E', '_', 'M', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'M', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'E', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
        ],
        blue.id,
        green.id,
      );

      expect(() =>
        game.placeBoat({
          gameID: game.id,
          playerID: blue.id,
          move: { boardColor: 'Blue', boat: 'End', col: 0, row: 0 },
        }),
      ).toThrowError(BOARD_POSITION_NOT_VALID_MESSAGE);
    });
  });
});

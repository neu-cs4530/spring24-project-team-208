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
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';

const GAME_NOT_WAITING_TO_START_MESSAGE = 'Game is not in waiting to start mode';
const NOT_YOUR_BOARD_MESSAGE = 'Not your board';
const MAX_NUM_BOAT_PIECES = 18;

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
  describe('removeBoat', () => {
    const blue = createPlayerForTesting();
    const green = createPlayerForTesting();
    beforeEach(() => {
      game.join(blue);
      game.join(green);
    });
    describe('when given a valid removal', () => {
      it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])(
        'should remove boat placement from the game state in row/column %d and not throw an error',
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
          game.removeBoat({
            gameID: game.id,
            playerID: blue.id,
            move: {
              boardColor: 'Blue',
              boat: 'End',
              col: idx as BattleShipColIndex,
              row: idx as BattleShipRowIndex,
            },
          });
          expect(game.state.blueBoard.length).toEqual(0);
        },
      );
      it.each(['Front' as BattleShipPiece, 'Middle' as BattleShipPiece, 'End' as BattleShipPiece])(
        'should remove piece regardless of given boat type for removal',
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
      it('should place max boat pieces in game state without throwing an error', () => {
        createBoatPlacementsFromPattern(
          game,
          'Blue',
          [
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'E'],
            ['_', 'F', 'M', 'M', 'M', 'E', '_', '_', '_', 'M'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
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
        expect(game.state.blueBoard.length).toEqual(MAX_NUM_BOAT_PIECES);
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
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'E'],
          ['_', 'F', 'M', 'M', 'M', 'E', '_', '_', '_', 'M'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'F'],
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

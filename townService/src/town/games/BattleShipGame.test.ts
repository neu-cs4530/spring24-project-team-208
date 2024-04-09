import {
  BattleShipColIndex,
  BattleShipColor,
  BattleShipRowIndex,
} from '../../types/CoveyTownSocket';
import BattleShipGame from './BattleShipGame';
import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  INVALID_MOVE_MESSAGE,
} from '../../lib/InvalidParametersError';

const NOT_YOUR_BOARD_MESSAGE = 'Not your board';
const NOT_IN_PLACEMENT = 'Game is not in placement phase';
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
 * @param gamePiece Color of board to apply pattern to
 * @param pattern Board pattern to apply
 * @param blueID ID of player with blue board
 * @param greenID ID of green player
 */
function createBoatPlacementsFromPattern(
  game: BattleShipGame,
  gamePiece: BattleShipColor,
  pattern: string[][],
  blueID: string,
  greenID: string,
) {
  type QueuedPlacement = {
    cell: any;
    rowIdx: BattleShipRowIndex;
    colIdx: BattleShipColIndex;
    vertical: boolean;
  };
  const queues = {
    Board: [] as QueuedPlacement[],
  };

  // Construct the queues of moves to make from the board pattern
  pattern.forEach((row, rowIdx) => {
    row.forEach((col, colIdx) => {
      let boat = '';
      switch (col.substring(0, 1)) {
        case 'A': {
          boat = 'Aircraft Carrier';
          break;
        }
        case 'B': {
          boat = 'Battleship';
          break;
        }
        case 'S': {
          boat = 'Submarine';
          break;
        }
        case 'C': {
          boat = 'Cruiser';
          break;
        }
        case 'D': {
          boat = 'Destroyer';
          break;
        }
        default: {
          return;
        }
      }

      queues.Board.push({
        cell: boat,
        rowIdx: rowIdx as BattleShipRowIndex,
        colIdx: colIdx as BattleShipColIndex,
        vertical: col.includes('V'),
      });
    });
  });

  const queue = queues.Board;
  if (queue.length === 0) return;
  for (const move of queue) {
    game.placeBoat(
      {
        gameID: game.id,
        move: {
          gamePiece,
          cell: move.cell,
          col: move.colIdx,
          row: move.rowIdx,
        },
        playerID: gamePiece === 'Blue' ? blueID : greenID,
      },
      move.vertical,
    );
    queues.Board = queue.filter(m => m !== move);
  }
}

describe('BattleShipGame', () => {
  let game: BattleShipGame;
  beforeEach(() => {
    game = new BattleShipGame();
  });
  describe('_join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      const player2 = createPlayerForTesting();
      game.join(player2);
      expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw an error if the player is not in the game and the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);

      expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
    });
    describe('if the player is not in the game and the game is not full', () => {
      describe('if the player was not the green color in the last game', () => {
        it('should add the player as blue if blue is empty', () => {
          const blue = createPlayerForTesting();
          game.join(blue);
          expect(game.state.blue).toBe(blue.id);
          expect(game.state.green).toBeUndefined();
          expect(game.state.blueReady).toBeFalsy();
          expect(game.state.greenReady).toBeFalsy();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        it('should add the player as green if blue is present', () => {
          const blue = createPlayerForTesting();
          const green = createPlayerForTesting();
          game.join(blue);
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
          game.join(green);
          expect(game.state.blue).toBe(blue.id);
          expect(game.state.green).toBe(green.id);
          expect(game.state.blueReady).toBeFalsy();
          expect(game.state.greenReady).toBeFalsy();
          expect(game.state.status).toBe('WAITING_TO_START');
        });
      });
      describe('if the player was green in the last game', () => {
        it('should add the player as green if green is empty', () => {
          const blue = createPlayerForTesting();
          const green = createPlayerForTesting();
          game.join(blue);
          game.join(green);
          expect(game.state.blue).toBe(blue.id); // First player should be blue
          expect(game.state.green).toBe(green.id); // Second player should be green
          // Now, make a new game with the state of the last one
          const secondGame = new BattleShipGame(game);
          expect(secondGame.state.blue).toBeUndefined();
          expect(secondGame.state.green).toBeUndefined();
          secondGame.join(green);
          expect(secondGame.state.blue).toBe(undefined);
          expect(secondGame.state.green).toBe(green.id);
          const newBlue = createPlayerForTesting();
          secondGame.join(newBlue);
          expect(secondGame.state.blue).toBe(newBlue.id);
        });
      });
      it('should set the status to WAITING_TO_START if both players are present', () => {
        const blue = createPlayerForTesting();
        const green = createPlayerForTesting();
        game.join(blue);
        game.join(green);
        expect(game.state.status).toBe('WAITING_TO_START');
        expect(game.state.blueReady).toBeFalsy();
        expect(game.state.greenReady).toBeFalsy();
      });
    });
  });
  describe('_leave', () => {
    it('should throw an error if the player is not in the game', () => {
      const player = createPlayerForTesting();
      expect(() => game.leave(player)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      game.join(player);
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    describe('when the player is in the game', () => {
      // NOTE: Below tests are meant to pass but currently fail because startGame not implemented yet
      describe('when the game is in progress', () => {
        const blue = createPlayerForTesting();
        const green = createPlayerForTesting();
        beforeEach(() => {
          game.join(blue);
          game.join(green);
          game.startGame(blue);
          game.startGame(green);
        });
        test('if the player is blue, it sets the winner to green and status to OVER', () => {
          game.leave(blue);
          expect(game.state.winner).toBe(green.id);
          expect(game.state.status).toBe('OVER');
        });
        test('if the player is green, it sets the winner to blue and status to OVER', () => {
          game.leave(green);
          expect(game.state.winner).toBe(blue.id);
          expect(game.state.status).toBe('OVER');
        });
      });
      test('when the game is already over before the player leaves, it does not update the state', () => {
        const blue = createPlayerForTesting();
        const green = createPlayerForTesting();
        game.join(blue);
        game.join(green);
        game.startGame(blue);
        game.startGame(green);
        expect(game.state.green).toBe(green.id);
        expect(game.state.blue).toBe(blue.id);
        game.leave(blue);
        expect(game.state.status).toBe('OVER');
        const stateBeforeLeaving = { ...game.state };
        game.leave(green);
        expect(game.state).toEqual(stateBeforeLeaving);
      });
      describe('when the game is waiting to start, with status WAITING_TO_START', () => {
        const blue = createPlayerForTesting();
        const green = createPlayerForTesting();
        test('if the player is blue, it sets blue to undefined and status to WAITING_FOR_PLAYERS', () => {
          game.join(blue);
          game.join(green);
          game.startGame(blue);
          expect(game.state.blueReady).toBeTruthy();
          game.leave(blue);
          expect(game.state.blueReady).toBeFalsy();
          expect(game.state.blue).toBeUndefined();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        test('if the player is green, it sets green to undefined and status to WAITING_FOR_PLAYERS', () => {
          game.join(blue);
          game.join(green);
          expect(game.state.greenReady).toBeFalsy();
          game.startGame(green);
          expect(game.state.greenReady).toBeTruthy();
          game.leave(green);
          expect(game.state.greenReady).toBeFalsy();
          expect(game.state.green).toBeUndefined();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        test('if the player is blue, and the "preferblue green" player joins, it should add the player as blue', () => {
          game.join(blue);
          game.join(green);

          expect(game.state.blue).toBe(blue.id);
          expect(game.state.green).toBe(green.id);
          expect(game.state.blueReady).toBeFalsy();
          expect(game.state.greenReady).toBeFalsy();
          expect(game.state.status).toBe('WAITING_TO_START');

          const secondGame = new BattleShipGame(game);
          expect(secondGame.state.blue).toBeUndefined();
          expect(secondGame.state.green).toBeUndefined();

          const newblue = createPlayerForTesting();
          secondGame.join(newblue);
          expect(secondGame.state.blue).toBe(newblue.id);
          const newgreen = createPlayerForTesting();
          secondGame.join(newgreen);
          expect(secondGame.state.green).toBe(newgreen.id);
          secondGame.leave(newblue);
          secondGame.join(green);
          expect(secondGame.state.blue).toBe(green.id);
          expect(secondGame.state.green).toBe(newgreen.id);
        });
      });
      describe('when the game is waiting for players, in state WAITING_FOR_PLAYERS', () => {
        test('if the player is blue, it sets blue to undefined, blueReady to false and status remains WAITING_FOR_PLAYERS', () => {
          const blue = createPlayerForTesting();
          game.join(blue);
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
          game.leave(blue);
          expect(game.state.blue).toBeUndefined();
          expect(game.state.blueReady).toBeFalsy();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        test('if the player is green, it sets green to undefined, greenReady to false and status remains WAITING_FOR_PLAYERS', () => {
          const blue = createPlayerForTesting();
          const green = createPlayerForTesting();
          game.join(blue);
          game.join(green);
          game.leave(blue);
          const secondGame = new BattleShipGame(game);
          secondGame.join(green);
          expect(secondGame.state.green).toBe(green.id);
          expect(secondGame.state.status).toBe('WAITING_FOR_PLAYERS');
          secondGame.leave(green);
          expect(secondGame.state.green).toBeUndefined();
          expect(secondGame.state.greenReady).toBeFalsy();
          expect(secondGame.state.status).toBe('WAITING_FOR_PLAYERS');
        });
      });
    });
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
    test('if blue board has incorrect horizontal boats, it throws an error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      game.startGame(blue);
      game.startGame(green);
      createBoatPlacementsFromPattern(
        game,
        'Blue',
        [
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'SV'],
          ['_', 'BH', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'AV', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', 'CH', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', 'DH', '_', '_', '_', '_', '_'],
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
      game.startGame(blue);
      game.startGame(green);
      expect(() =>
        createBoatPlacementsFromPattern(
          game,
          'Green',
          [
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'SV'],
            ['_', 'BH', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'AH', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', 'CH', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', 'DH', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ],
          blue.id,
          green.id,
        ),
      ).toThrowError();
    });
    test('if a horizontal and vertical boat invalidly intersect, should throw error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      game.startGame(blue);
      game.startGame(green);
      expect(() =>
        createBoatPlacementsFromPattern(
          game,
          'Blue',
          [
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', 'BH', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'SV', '_', '_'],
            ['_', '_', '_', '_', '_', '_', 'AH', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', 'CH', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', 'DH', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ],
          blue.id,
          green.id,
        ),
      ).toThrowError();
    });
    test('if overlapping boats, it should not throw an error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      game.startGame(blue);
      game.startGame(green);
      createBoatPlacementsFromPattern(
        game,
        'Blue',
        [
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'SV'],
          ['_', 'BH', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', 'AV', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', 'CH', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', 'DH', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
        ],
        blue.id,
        green.id,
      );
      expect(game.state.blueReady).toBe(true);
      expect(game.state.greenReady).toBeFalsy();
      expect(game.state.status).toBe('PLACING_BOATS');
    });
    test('if blue board has incorrect vertical boats, it throws an error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      game.startGame(blue);
      game.startGame(green);
      expect(() =>
        createBoatPlacementsFromPattern(
          game,
          'Blue',
          [
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', 'BH', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'AV', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', 'CH', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', 'DH', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'SV'],
          ],
          blue.id,
          green.id,
        ),
      ).toThrowError(INVALID_MOVE_MESSAGE);
    });
    test('if green board has incorrect vertical boats, it throws an error', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      game.join(blue);
      game.join(green);
      game.startGame(green);
      game.startGame(blue);
      expect(() =>
        createBoatPlacementsFromPattern(
          game,
          'Green',
          [
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', 'BH', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', 'AV', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', 'CH', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', 'DH', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', 'SV', '_'],
          ],
          blue.id,
          green.id,
        ),
      ).toThrowError(INVALID_MOVE_MESSAGE);
    });
    describe('if the player is in the game', () => {
      const blue = createPlayerForTesting();
      const green = createPlayerForTesting();
      beforeEach(() => {
        game.join(blue);
        game.join(green);
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
      test('if both players are ready, it sets the status to PLACING_BOATS', () => {
        game.startGame(blue);
        game.startGame(green);
        expect(game.state.blueReady).toBe(false);
        expect(game.state.greenReady).toBe(false);
        expect(game.state.status).toBe('PLACING_BOATS');
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
  //   describe('removeBoat', () => {
  //     const blue = createPlayerForTesting();
  //     const green = createPlayerForTesting();
  //     beforeEach(() => {
  //       game.join(blue);
  //       game.join(green);
  //     });
  //     describe('when given a valid removal', () => {
  //       it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])(
  //         'should remove boat placement from the game state in row/column %d and not throw an error for green board',
  //         (idx: number) => {
  //           game.placeBoat({
  //             gameID: game.id,
  //             playerID: green.id,
  //             move: {
  //               gamePiece: 'Green',
  //               cell: 'Front',
  //               col: idx as BattleShipColIndex,
  //               row: idx as BattleShipRowIndex,
  //             },
  //           });
  //           game.removeBoat({
  //             gameID: game.id,
  //             playerID: green.id,
  //             move: {
  //               gamePiece: 'Green',
  //               cell: 'Front',
  //               col: idx as BattleShipColIndex,
  //               row: idx as BattleShipRowIndex,
  //             },
  //           });
  //           expect(game.state.greenBoard.length).toEqual(0);
  //         },
  //       );
  //       it('should remove boat placement from the game state in row 0 col 1 and not throw an error for blue board', () => {
  //         game.placeBoat({
  //           gameID: game.id,
  //           playerID: blue.id,
  //           move: { gamePiece: 'Blue', cell: 'Middle', col: 0, row: 1 },
  //         });
  //         game.removeBoat({
  //           gameID: game.id,
  //           playerID: blue.id,
  //           move: { gamePiece: 'Blue', cell: 'Middle', col: 0, row: 1 },
  //         });
  //         expect(game.state.blueBoard.length).toEqual(0);
  //       });
  //       it.each(['Front' as BattleShipPiece, 'Middle' as BattleShipPiece, 'End' as BattleShipPiece])(
  //         'should remove piece regardless of given boat type for removal for blue board',
  //         (boatType: BattleShipPiece) => {
  //           game.placeBoat({
  //             gameID: game.id,
  //             playerID: blue.id,
  //             move: {
  //               gamePiece: 'Blue',
  //               cell: 'End',
  //               col: 0,
  //               row: 0,
  //             },
  //           });
  //           game.removeBoat({
  //             gameID: game.id,
  //             playerID: blue.id,
  //             move: {
  //               gamePiece: 'Blue',
  //               cell: boatType,
  //               col: 0,
  //               row: 0,
  //             },
  //           });
  //           expect(game.state.blueBoard.length).toEqual(0);
  //         },
  //       );
  //       it.each(['Front' as BattleShipPiece, 'Middle' as BattleShipPiece, 'End' as BattleShipPiece])(
  //         'should remove piece regardless of given boat type for removal for green board',
  //         (boatType: BattleShipPiece) => {
  //           game.placeBoat({
  //             gameID: game.id,
  //             playerID: green.id,
  //             move: {
  //               gamePiece: 'Green',
  //               cell: 'End',
  //               col: 0,
  //               row: 0,
  //             },
  //           });
  //           game.removeBoat({
  //             gameID: game.id,
  //             playerID: green.id,
  //             move: {
  //               gamePiece: 'Green',
  //               cell: boatType,
  //               col: 0,
  //               row: 0,
  //             },
  //           });
  //           expect(game.state.greenBoard.length).toEqual(0);
  //         },
  //       );
  //       it('should not throw an error if there is no boat in the requested removal space', () => {
  //         game.removeBoat({
  //           gameID: game.id,
  //           playerID: blue.id,
  //           move: { gamePiece: 'Blue', cell: 'Middle', col: 0, row: 0 },
  //         });
  //         expect(game.state.blueBoard.length).toEqual(0);
  //       });
  //     });
  //   });
  //   describe('when given an invlaid removal request', () => {
  //     it('should throw an error if the game is not waiting to start', () => {
  //       const player = createPlayerForTesting();
  //       game.join(player);

  //       expect(() =>
  //         game.removeBoat({
  //           gameID: game.id,
  //           playerID: player.id,
  //           move: { gamePiece: 'Blue', cell: 'End', col: 0, row: 0 },
  //         }),
  //       ).toThrowError(GAME_NOT_WAITING_TO_START_MESSAGE);
  //     });
  //     it('should throw an error if the player is not in game', () => {
  //       const player = createPlayerForTesting();
  //       const blue = createPlayerForTesting();
  //       const green = createPlayerForTesting();
  //       game.join(blue);
  //       game.join(green);

  //       expect(() =>
  //         game.removeBoat({
  //           gameID: game.id,
  //           playerID: player.id,
  //           move: { gamePiece: 'Blue', cell: 'End', col: 0, row: 0 },
  //         }),
  //       ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
  //     });
  //     it('should throw an error if blue tries to remove a piece on the green board', () => {
  //       const blue = createPlayerForTesting();
  //       const green = createPlayerForTesting();
  //       game.join(blue);
  //       game.join(green);

  //       expect(() =>
  //         game.removeBoat({
  //           gameID: game.id,
  //           playerID: blue.id,
  //           move: { gamePiece: 'Green', cell: 'End', col: 0, row: 0 },
  //         }),
  //       ).toThrowError(NOT_YOUR_BOARD_MESSAGE);
  //     });
  //     it('should throw an error if green tries to remove a piece on the blue board', () => {
  //       const blue = createPlayerForTesting();
  //       const green = createPlayerForTesting();
  //       game.join(blue);
  //       game.join(green);

  //       expect(() =>
  //         game.removeBoat({
  //           gameID: game.id,
  //           playerID: green.id,
  //           move: { gamePiece: 'Blue', cell: 'End', col: 0, row: 0 },
  //         }),
  //       ).toThrowError(NOT_YOUR_BOARD_MESSAGE);
  //     });
  //   });
  describe('placeBoat', () => {
    const blue = createPlayerForTesting();
    const green = createPlayerForTesting();
    beforeEach(() => {
      game.join(blue);
      game.join(green);
      game.startGame(blue);
      game.startGame(green);
    });
    describe('when given a valid move', () => {
      it('should place a boat piece in row 0 column 0 for blue board without error', () => {
        game.placeBoat(
          {
            gameID: game.id,
            playerID: blue.id,
            move: {
              gamePiece: 'Blue',
              cell: 'Battleship',
              col: 0 as BattleShipColIndex,
              row: 0 as BattleShipRowIndex,
            },
          },
          true,
        );
        expect(game.state.blueBoard[0]).toEqual({
          type: 'Battleship_Back',
          state: 'Safe',
          row: 0,
          col: 0,
        });
        expect(game.state.blueBoard[4]).toEqual({
          type: 'Ocean',
          state: 'Safe',
          row: 0,
          col: 4,
        });
      });
      it('should place max boat pieces in game state without throwing an error for blue board', () => {
        createBoatPlacementsFromPattern(
          game,
          'Blue',
          [
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'CV'],
            ['_', 'AH', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', 'BV', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', 'SH', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', 'DH', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ],
          blue.id,
          green.id,
        );
        expect(game.state.blueBoard.length).toEqual(100);
      });
      it('should place max boat pieces in game state without throwing an error for green board', () => {
        createBoatPlacementsFromPattern(
          game,
          'Green',
          [
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'CV'],
            ['_', 'AH', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', 'BV', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', 'SH', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', 'DH', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
          ],
          blue.id,
          green.id,
        );
        expect(game.state.greenBoard.length).toEqual(100);
      });
      describe('when given an invalid placement request', () => {
        beforeEach(() => {
          game = new BattleShipGame();
          game.join(blue);
          game.join(green);
        });
        it('should throw an error if the player is not in game', () => {
          const player = createPlayerForTesting();
          game.startGame(blue);
          game.startGame(green);

          expect(() =>
            game.placeBoat(
              {
                gameID: game.id,
                playerID: player.id,
                move: { gamePiece: 'Blue', cell: 'Battleship', col: 0, row: 0 },
              },
              true,
            ),
          ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
        });
        it('should throw an error if the game is not in the placement phase', () => {
          expect(() =>
            game.placeBoat(
              {
                gameID: game.id,
                playerID: green.id,
                move: { gamePiece: 'Blue', cell: 'Battleship', col: 0, row: 0 },
              },
              true,
            ),
          ).toThrowError(NOT_IN_PLACEMENT);
        });
        it('should throw an error if blue tries to place a piece on the green board', () => {
          game.startGame(blue);
          game.startGame(green);

          expect(() =>
            game.placeBoat(
              {
                gameID: game.id,
                playerID: blue.id,
                move: { gamePiece: 'Green', cell: 'Battleship', col: 0, row: 0 },
              },
              true,
            ),
          ).toThrowError(NOT_YOUR_BOARD_MESSAGE);
        });
        it('should throw an error if green tries to place a piece on the blue board', () => {
          game.startGame(blue);
          game.startGame(green);
          expect(() =>
            game.placeBoat(
              {
                gameID: game.id,
                playerID: green.id,
                move: { gamePiece: 'Blue', cell: 'Battleship', col: 0, row: 0 },
              },
              true,
            ),
          ).toThrowError(NOT_YOUR_BOARD_MESSAGE);
        });
        it('should throw an error if there is already a piece in the given position', () => {
          game.startGame(blue);
          game.startGame(green);
          game.placeBoat(
            {
              gameID: game.id,
              playerID: blue.id,
              move: { gamePiece: 'Blue', cell: 'Battleship', col: 0, row: 0 },
            },
            true,
          );
          expect(() =>
            game.placeBoat(
              {
                gameID: game.id,
                playerID: blue.id,
                move: { gamePiece: 'Blue', cell: 'Aircraft Carrier', col: 0, row: 0 },
              },
              false,
            ),
          ).toThrowError(INVALID_MOVE_MESSAGE);
        });
        it('should throw an error if max number of boats have been placed on the board', () => {
          game.startGame(blue);
          game.startGame(green);
          createBoatPlacementsFromPattern(
            game,
            'Blue',
            [
              ['_', '_', '_', '_', '_', '_', '_', '_', '_', 'CV'],
              ['_', 'AH', '_', '_', '_', '_', '_', '_', '_', '_'],
              ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
              ['_', 'BV', '_', '_', '_', '_', '_', '_', '_', '_'],
              ['_', '_', '_', '_', '_', 'SH', '_', '_', '_', '_'],
              ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
              ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
              ['_', '_', '_', '_', '_', '_', 'DH', '_', '_', '_'],
              ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
              ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
            ],
            blue.id,
            green.id,
          );

          expect(() =>
            game.placeBoat(
              {
                gameID: game.id,
                playerID: blue.id,
                move: { gamePiece: 'Blue', cell: 'Battleship', col: 0, row: 0 },
              },
              true,
            ),
          ).toThrowError(INVALID_MOVE_MESSAGE);
        });
      });
    });
  });
});

import BattleShipGame from './BattleShipGame';
import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';

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
          expect(game.state.status).toBe('ARRANGING_BOATS');
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
      it('should set the status to ARRANGING_BOATS if both players are present', () => {
        const blue = createPlayerForTesting();
        const green = createPlayerForTesting();
        game.join(blue);
        game.join(green);
        expect(game.state.status).toBe('ARRANGING_BOATS');
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
        test('if the player is blue, it sets the winner to green and status to OVER', () => {
          const blue = createPlayerForTesting();
          const green = createPlayerForTesting();
          game.join(blue);
          game.join(green);
          game.startGame(blue);
          game.startGame(green);
          game.leave(blue);
          expect(game.state.winner).toBe(green.id);
          expect(game.state.status).toBe('OVER');
        });
        test('if the player is green, it sets the winner to blue and status to OVER', () => {
          const blue = createPlayerForTesting();
          const green = createPlayerForTesting();
          game.join(blue);
          game.join(green);
          game.startGame(blue);
          game.startGame(green);
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
      describe('when the game is waiting to start, with status ARRANGING_BOATS', () => {
        test('if the player is blue, it sets blue to undefined and status to WAITING_FOR_PLAYERS', () => {
          const blue = createPlayerForTesting();
          const green = createPlayerForTesting();
          game.join(blue);
          expect(game.state.blueReady).toBeFalsy();
          game.join(green);
          game.startGame(blue);
          expect(game.state.blueReady).toBeTruthy();
          game.leave(blue);
          expect(game.state.blueReady).toBeFalsy();
          expect(game.state.blue).toBeUndefined();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        test('if the player is green, it sets green to undefined and status to WAITING_FOR_PLAYERS', () => {
          const blue = createPlayerForTesting();
          const green = createPlayerForTesting();
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
          const blue = createPlayerForTesting();
          const green = createPlayerForTesting();
          game.join(blue);
          game.join(green);

          expect(game.state.blue).toBe(blue.id);
          expect(game.state.green).toBe(green.id);
          expect(game.state.blueReady).toBeFalsy();
          expect(game.state.greenReady).toBeFalsy();
          expect(game.state.status).toBe('ARRANGING_BOATS');

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
});

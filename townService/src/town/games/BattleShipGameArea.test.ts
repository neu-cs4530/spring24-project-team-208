import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import Player from '../../lib/Player';
import {
  BattleShipColor,
  BattleShipGameState,
  BattleShipGuess,
  BattleShipPlacement,
  GameInstanceID,
  GameMove,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import BattleShipGame from './BattleShipGame';
import BattleShipGameArea from './BattleShipGameArea';
import * as BattleShipGameModule from './BattleShipGame';
import Game from './Game';
import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';

class TestingGame extends Game<BattleShipGameState, BattleShipGuess> {
  public setUpMove(position: GameMove<BattleShipPlacement>): void {
    throw new Error('Method not implemented.');
  }

  public constructor(priorGame?: BattleShipGame) {
    super({
      moves: [],
      blueBoard: [],
      greenBoard: [],
      status: 'WAITING_TO_START',
      firstPlayer: 'Blue',
    });
  }

  public applyMove(move: GameMove<BattleShipGuess>): void {}

  public placeBoat(move: GameMove<BattleShipPlacement>): void {}

  public removeBoat(move: GameMove<BattleShipPlacement>): void {}

  public endGame(winner?: string) {
    this.state = {
      ...this.state,
      status: 'OVER',
      winner,
    };
  }

  public startGame(player: Player) {
    if (this.state.blue === player.id) this.state.blueReady = true;
    else this.state.greenReady = true;
  }

  protected _join(player: Player): void {
    if (this.state.blue) this.state.green = player.id;
    else this.state.blue = player.id;
    this._players.push(player);
  }

  protected _leave(player: Player): void {}
}
describe('BattleShipGameArea', () => {
  let gameArea: BattleShipGameArea;
  let blue: Player;
  let green: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  const gameConstructorSpy = jest.spyOn(BattleShipGameModule, 'default');
  let game: TestingGame;

  beforeEach(() => {
    gameConstructorSpy.mockClear();
    game = new TestingGame();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameConstructorSpy.mockReturnValue(game);

    blue = createPlayerForTesting();
    green = createPlayerForTesting();
    gameArea = new BattleShipGameArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );
    gameArea.add(blue);
    game.join(blue);
    gameArea.add(green);
    game.join(green);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });

  describe('[T3.1] JoinGame command', () => {
    test('when there is no existing game, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, blue);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
    test('when there is a game that just ended, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();

      gameConstructorSpy.mockClear();
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, blue);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
      game.endGame();

      gameConstructorSpy.mockClear();
      const { gameID: newGameID } = gameArea.handleCommand({ type: 'JoinGame' }, blue);
      expect(gameArea.game).toBeDefined();
      expect(newGameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
    });
    describe('when there is a game in progress', () => {
      it('should call join on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, blue);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

        const joinSpy = jest.spyOn(game, 'join');
        const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, green).gameID;
        expect(joinSpy).toHaveBeenCalledWith(green);
        expect(gameID).toEqual(gameID2);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, blue);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();

        const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() => gameArea.handleCommand({ type: 'JoinGame' }, green)).toThrowError(
          'Test Error',
        );
        expect(joinSpy).toHaveBeenCalledWith(green);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
  describe('[T3.2] StartGame command', () => {
    it('when there is no game, it should throw an error and not call _emitAreaChanged', () => {
      expect(() =>
        gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, blue),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
    });
    describe('when there is a game in progress', () => {
      it('should call startGame on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, blue);
        interactableUpdateSpy.mockClear();
        gameArea.handleCommand({ type: 'StartGame', gameID }, green);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, blue);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();

        const startSpy = jest.spyOn(game, 'startGame').mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() =>
          gameArea.handleCommand({ type: 'StartGame', gameID: game.id }, green),
        ).toThrowError('Test Error');
        expect(startSpy).toHaveBeenCalledWith(green);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      test('when the game ID mismatches, it should throw an error and not call _emitAreaChanged', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, blue);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(() =>
          gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, blue),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      });
    });
  });
  describe('[T3.3] SetUpGameMove command', () => {
    it('should throw an error if there is no game in waiting to start mode', () => {
      interactableUpdateSpy.mockClear();

      expect(() =>
        gameArea.handleCommand(
          {
            type: 'SetUpGameMove',
            placement: { col: 0, row: 0, gamePiece: 'Blue', cell: 'Aircraft_Middle_1' },
            vertical: true,
            // placementType: 'Placement',
            gameID: nanoid(),
          },
          blue,
        ),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });
    describe('when the game is in waiting to start mode', () => {
      let gameID: GameInstanceID;
      beforeEach(() => {
        gameID = gameArea.handleCommand({ type: 'JoinGame' }, blue).gameID;
        gameArea.handleCommand({ type: 'JoinGame' }, green);
        interactableUpdateSpy.mockClear();
      });
      it('should throw an error if the gameID does not match the game and not call _emitAreaChanged', () => {
        expect(() =>
          gameArea.handleCommand(
            {
              type: 'SetUpGameMove',
              placement: { col: 0, row: 0, gamePiece: 'Blue', cell: 'Aircraft_Middle_1' },
              vertical: true,
              // placementType: 'Placement',
              gameID: nanoid(),
            },
            blue,
          ),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      });
      it('should call placeBoat on the game and call _emitAreaChanged', () => {
        const placement: BattleShipPlacement = {
          col: 0,
          row: 0,
          gamePiece: 'Blue',
          cell: 'Aircraft Carrier',
        };
        const placeBoatSpy = jest.spyOn(game, 'placeBoat');
        gameArea.handleCommand(
          {
            type: 'SetUpGameMove',
            placement,
            // placementType: 'Placement',
            vertical: true,
            gameID,
          },
          blue,
        );
        expect(placeBoatSpy).toHaveBeenCalledWith({
          gameID: game.id,
          playerID: blue.id,
          move: {
            ...placement,
            gamePiece: 'Blue',
          },
        },
        true);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
      });
      // it('should call removeBoat on the game and call _emitAreaChanged', () => {
      //   const placement: BattleShipPlacement = { col: 0, row: 0, gamePiece: 'Blue', boat: 'End' };
      //   const removeBoatSpy = jest.spyOn(game, 'removeBoat');
      //   gameArea.handleCommand(
      //     { type: 'SetUpGameMove', placement, placementType: 'Removal', gameID },
      //     blue,
      //   );
      //   expect(removeBoatSpy).toHaveBeenCalledWith({
      //     gameID: game.id,
      //     playerID: blue.id,
      //     move: {
      //       ...placement,
      //       gamePiece: 'Blue',
      //     },
      //   });
      //   expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
      // });
    });
  });
  describe('[T3.3] GameMove command', () => {
    it('should throw an error if there is no game in progress and not call _emitAreaChanged', () => {
      interactableUpdateSpy.mockClear();

      expect(() =>
        gameArea.handleCommand(
          { type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'X' }, gameID: nanoid() },
          blue,
        ),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });
    describe('when there is a game in progress', () => {
      let gameID: GameInstanceID;
      beforeEach(() => {
        gameID = gameArea.handleCommand({ type: 'JoinGame' }, blue).gameID;
        gameArea.handleCommand({ type: 'JoinGame' }, green);
        interactableUpdateSpy.mockClear();
      });
      it('should throw an error if the gameID does not match the game and not call _emitAreaChanged', () => {
        expect(() =>
          gameArea.handleCommand(
            { type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'Green' }, gameID: nanoid() },
            blue,
          ),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      });
      it('should call applyMove on the game and call _emitAreaChanged', () => {
        const move: BattleShipGuess = { col: 0, row: 0, gamePiece: 'Blue' };
        const applyMoveSpy = jest.spyOn(game, 'applyMove');
        gameArea.handleCommand({ type: 'GameMove', move, gameID }, blue);
        expect(applyMoveSpy).toHaveBeenCalledWith({
          gameID: game.id,
          playerID: blue.id,
          move: {
            ...move,
            gamePiece: 'Blue',
          },
        });
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        const move: BattleShipGuess = { col: 0, row: 0, gamePiece: 'Blue' };
        const applyMoveSpy = jest.spyOn(game, 'applyMove');
        applyMoveSpy.mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() => gameArea.handleCommand({ type: 'GameMove', move, gameID }, blue)).toThrowError(
          'Test Error',
        );
        expect(applyMoveSpy).toHaveBeenCalledWith({
          gameID: game.id,
          playerID: blue.id,
          move: {
            ...move,
            gamePiece: 'Blue',
          },
        });
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      describe('when the game ends', () => {
        test.each<BattleShipColor>(['Blue', 'Green'])(
          'when the game is won by %p',
          (winner: BattleShipColor) => {
            const finalMove: BattleShipGuess = { col: 0, row: 0, gamePiece: 'Blue' };
            jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
              game.endGame(winner === 'Blue' ? blue.id : green.id);
            });
            gameArea.handleCommand({ type: 'GameMove', move: finalMove, gameID }, blue);
            expect(game.state.status).toEqual('OVER');
            expect(gameArea.history.length).toEqual(1);
            const winningUsername = winner === 'Blue' ? blue.userName : green.userName;
            const losingUsername = winner === 'Blue' ? green.userName : blue.userName;
            expect(gameArea.history[0]).toEqual({
              gameID: game.id,
              scores: {
                [winningUsername]: 1,
                [losingUsername]: 0,
              },
            });
            expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          },
        );
        test('when the game results in a tie', () => {
          const finalMove: BattleShipGuess = { col: 0, row: 0, gamePiece: 'Blue' };
          jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
            game.endGame();
          });
          gameArea.handleCommand({ type: 'GameMove', move: finalMove, gameID }, blue);
          expect(game.state.status).toEqual('OVER');
          expect(gameArea.history.length).toEqual(1);
          expect(gameArea.history[0]).toEqual({
            gameID: game.id,
            scores: {
              [blue.userName]: 0,
              [green.userName]: 0,
            },
          });
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
  describe('[T3.4] LeaveGame command', () => {
    it('should throw an error if there is no game in progress and not call _emitAreaChanged', () => {
      expect(() =>
        gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, blue),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });
    describe('when there is a game in progress', () => {
      it('should throw an error if the gameID does not match the game and not call _emitAreaChanged', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, blue);
        interactableUpdateSpy.mockClear();
        expect(() =>
          gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, blue),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      it('should call leave on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, blue);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        const leaveSpy = jest.spyOn(game, 'leave');
        gameArea.handleCommand({ type: 'LeaveGame', gameID }, blue);
        expect(leaveSpy).toHaveBeenCalledWith(blue);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, blue);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();
        const leaveSpy = jest.spyOn(game, 'leave').mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() =>
          gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, blue),
        ).toThrowError('Test Error');
        expect(leaveSpy).toHaveBeenCalledWith(blue);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      test.each<BattleShipColor>(['Blue', 'Green'])(
        'when the game is won by %p, it updates the history',
        (playerThatWins: BattleShipColor) => {
          const leavingPlayer = playerThatWins === 'Blue' ? green : blue;
          const winningPlayer = playerThatWins === 'Blue' ? blue : green;

          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, blue);
          gameArea.handleCommand({ type: 'JoinGame' }, green);

          interactableUpdateSpy.mockClear();

          jest.spyOn(game, 'leave').mockImplementationOnce(() => {
            game.endGame(winningPlayer.id);
          });
          gameArea.handleCommand({ type: 'LeaveGame', gameID }, leavingPlayer);
          expect(game.state.status).toEqual('OVER');
          expect(gameArea.history.length).toEqual(1);
          const winningUsername = winningPlayer.userName;
          const losingUsername = leavingPlayer.userName;

          expect(gameArea.history[0]).toEqual({
            gameID: game.id,
            scores: {
              [winningUsername]: 1,
              [losingUsername]: 0,
            },
          });
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        },
      );
    });
  });
  test('[T3.5] When given an invalid command it should throw an error', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing an invalid command, only possible at the boundary of the type system)
    expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, blue)).toThrowError(
      INVALID_COMMAND_MESSAGE,
    );
    expect(interactableUpdateSpy).not.toHaveBeenCalled();
  });
});

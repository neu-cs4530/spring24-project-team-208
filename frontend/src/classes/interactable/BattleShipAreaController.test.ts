import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  BattleShipColIndex,
  BattleShipColor,
  BattleShipGuess,
  BattleShipPlacement,
  BattleShipRowIndex,
  GameResult,
  GameStatus,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import BattleShipAreaController, {
  BATTLESHIP_COLS,
  BATTLESHIP_ROWS,
} from './BattleShipAreaController';
import GameAreaController from './GameAreaController';

describe('BattleShipAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });

  function updateGameWithPlacement(
    controller: BattleShipAreaController,
    nextMove: BattleShipPlacement,
  ): void {
    const nextState = Object.assign({}, controller.toInteractableAreaModel());
    const nextGame = Object.assign({}, nextState.game);
    nextState.game = nextGame;
    const newState = Object.assign({}, nextGame.state);
    nextGame.state = newState;
    if (nextMove.gamePiece === 'Blue') {
      newState.blueBoard = newState.blueBoard.concat([nextMove]);
    }
    if (nextMove.gamePiece === 'Green') {
      newState.greenBoard = newState.greenBoard.concat([nextMove]);
    }
    controller.updateFrom(nextState, controller.occupants);
  }
  function battleShipAreaControllerWithProps({
    _id,
    history,
    blue,
    green,
    undefinedGame,
    status,
    moves,
    blueBoard,
    greenBoard,
    gameInstanceID,
    winner,
    firstPlayer,
    observers,
  }: {
    _id?: string;
    history?: GameResult[];
    blue?: string;
    green?: string;
    undefinedGame?: boolean;
    status?: GameStatus;
    gameInstanceID?: string;
    moves?: BattleShipMove[];
    blueBoard?: BattleShipPlacement[];
    greenBoard?: BattleShipPlacement[];
    winner?: string;
    firstPlayer?: BattleShipColor;
    observers?: string[];
  }) {
    const id = _id || `INTERACTABLE-ID-${nanoid()}`;
    const instanceID = gameInstanceID || `GAME-INSTANCE-ID-${nanoid()}`;
    const players = [];
    if (blue) players.push(blue);
    if (green) players.push(green);
    if (observers) players.push(...observers);
    const ret = new BattleShipAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'BattleShipArea',
        game: undefinedGame
          ? undefined
          : {
              id: instanceID,
              players: players,
              state: {
                status: status || 'IN_PROGRESS',
                blue: blue,
                green: green,
                moves: moves || [],
                blueBoard: blueBoard || [],
                greenBoard: greenBoard || [],
                winner: winner,
                firstPlayer: firstPlayer || 'Blue',
              },
            },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }
  describe('[T1.1] Properties at the start of the game', () => {
    describe('blueBoard', () => {
      it('returns an empty board if there are no moves yet', () => {
        const controller = battleShipAreaControllerWithProps({ status: 'IN_PROGRESS', moves: [] });
        //Expect correct number of rows
        expect(controller.blueBoard.length).toBe(BATTLESHIP_ROWS);
        for (let i = 0; i < BATTLESHIP_ROWS; i++) {
          //Expect correct number of columns
          expect(controller.blueBoard[i].length).toBe(BATTLESHIP_COLS);
          for (let j = 0; j < BATTLESHIP_COLS; j++) {
            //Expect each cell to be empty
            expect(controller.blueBoard[i][j]).toBeUndefined();
          }
        }
      });
    });
    describe('greenBoard', () => {
      it('returns an empty board if there are no moves yet', () => {
        const controller = battleShipAreaControllerWithProps({ status: 'IN_PROGRESS', moves: [] });
        //Expect correct number of rows
        expect(controller.greenBoard.length).toBe(BATTLESHIP_ROWS);
        for (let i = 0; i < BATTLESHIP_ROWS; i++) {
          //Expect correct number of columns
          expect(controller.greenBoard[i].length).toBe(BATTLESHIP_COLS);
          for (let j = 0; j < BATTLESHIP_COLS; j++) {
            //Expect each cell to be empty
            expect(controller.greenBoard[i][j]).toBeUndefined();
          }
        }
      });
    });
    describe('blue', () => {
      it('returns the blue player if there is a blue player', () => {
        const controller = battleShipAreaControllerWithProps({ blue: ourPlayer.id });
        expect(controller.blue).toBe(ourPlayer);
      });
      it('returns undefined if there is no blue player', () => {
        const controller = battleShipAreaControllerWithProps({ blue: undefined });
        expect(controller.blue).toBeUndefined();
      });
    });
    describe('green', () => {
      it('returns the green player if there is a green player', () => {
        const controller = battleShipAreaControllerWithProps({ green: ourPlayer.id });
        expect(controller.green).toBe(ourPlayer);
      });
      it('returns undefined if there is no green player', () => {
        const controller = battleShipAreaControllerWithProps({ green: undefined });
        expect(controller.green).toBeUndefined();
      });
    });
    describe('winner', () => {
      it('returns the winner if there is a winner', () => {
        const controller = battleShipAreaControllerWithProps({
          green: ourPlayer.id,
          winner: ourPlayer.id,
        });
        expect(controller.winner).toBe(ourPlayer);
      });
      it('returns undefined if there is no winner', () => {
        const controller = battleShipAreaControllerWithProps({ winner: undefined });
        expect(controller.winner).toBeUndefined();
      });
    });
    describe('moveCount', () => {
      it('returns the number of moves from the game state', () => {
        const controller = battleShipAreaControllerWithProps({
          moves: [
            { col: 0, gamePiece: 'Blue', row: 0 },
            { col: 1, gamePiece: 'Green', row: 0 },
          ],
        });
        expect(controller.moveCount).toBe(2);
      });
    });
    describe('isOurTurn', () => {
      it('returns true if it is our turn', () => {
        const controller = battleShipAreaControllerWithProps({
          blue: ourPlayer.id,
          firstPlayer: 'Blue',
          status: 'IN_PROGRESS',
          green: otherPlayers[0].id,
        });
        expect(controller.isOurTurn).toBe(true);
      });
      it('returns false if it is not our turn', () => {
        const controller = battleShipAreaControllerWithProps({
          blue: ourPlayer.id,
          firstPlayer: 'Green',
          status: 'IN_PROGRESS',
          green: otherPlayers[0].id,
        });
        expect(controller.isOurTurn).toBe(false);
      });
    });
    describe('whoseTurn', () => {
      it('returns blue if the first player is blue', () => {
        const controller = battleShipAreaControllerWithProps({
          blue: ourPlayer.id,
          firstPlayer: 'Blue',
          status: 'IN_PROGRESS',
          green: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(controller.blue);
      });
      it('returns green if the first player is green', () => {
        const controller = battleShipAreaControllerWithProps({
          blue: ourPlayer.id,
          firstPlayer: 'Green',
          status: 'IN_PROGRESS',
          green: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(controller.green);
      });
    });
    describe('isPlayer', () => {
      it('returns true if we are a player', () => {
        const controller = battleShipAreaControllerWithProps({ blue: ourPlayer.id });
        expect(controller.isPlayer).toBe(true);
      });
      it('returns false if we are not a player', () => {
        const controller = battleShipAreaControllerWithProps({ blue: undefined });
        expect(controller.isPlayer).toBe(false);
      });
    });
    describe('gamePiece', () => {
      it('returns Blue if we are blue', () => {
        const controller = battleShipAreaControllerWithProps({ blue: ourPlayer.id });
        expect(controller.gamePiece).toBe('Blue');
      });
      it('returns Green if we are green', () => {
        const controller = battleShipAreaControllerWithProps({ green: ourPlayer.id });
        expect(controller.gamePiece).toBe('Green');
      });
      it('throws an error if we are not a player', () => {
        const controller = battleShipAreaControllerWithProps({ blue: undefined });
        expect(() => controller.gamePiece).toThrowError();
      });
    });
    describe('isEmpty', () => {
      it('returns true if there are no players', () => {
        const controller = battleShipAreaControllerWithProps({ blue: undefined });
        expect(controller.isEmpty()).toBe(true);
      });
      it('returns false if there is a single blue player', () => {
        const controller = battleShipAreaControllerWithProps({ blue: ourPlayer.id });
        expect(controller.isEmpty()).toBe(false);
      });
      it('returns false if there is a single green player', () => {
        const controller = battleShipAreaControllerWithProps({ green: ourPlayer.id });
        expect(controller.isEmpty()).toBe(false);
      });
      it('returns false if there are multiple players', () => {
        const controller = battleShipAreaControllerWithProps({
          blue: ourPlayer.id,
          green: otherPlayers[0].id,
        });
        expect(controller.isEmpty()).toBe(false);
      });
      it('returns false if there are no players but there are observers', () => {
        const controller = battleShipAreaControllerWithProps({ observers: [ourPlayer.id] });
        expect(controller.isEmpty()).toBe(false);
      });
    });
    describe('isActive', () => {
      it('returns true if the game is not empty and it is not waiting for players', () => {
        const controller = battleShipAreaControllerWithProps({
          blue: ourPlayer.id,
          green: otherPlayers[0].id,
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('returns false if the game is empty', () => {
        const controller = battleShipAreaControllerWithProps({
          blue: undefined,
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(false);
      });
      it('returns false if the game is waiting for players', () => {
        const controller = battleShipAreaControllerWithProps({
          blue: ourPlayer.id,
          green: otherPlayers[0].id,
          status: 'WAITING_FOR_PLAYERS',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
  });
  describe('[T1.2] Properties during the game, modified by _updateFrom ', () => {
    let controller: BattleShipAreaController;
    beforeEach(() => {
      controller = battleShipAreaControllerWithProps({
        blue: ourPlayer.id,
        green: otherPlayers[0].id,
        status: 'IN_PROGRESS',
      });
    });
    it('returns the correct board after a placement', () => {
      updateGameWithPlacement(controller, { col: 0, gamePiece: 'Blue', boat: 'End', row: 0 });
      expect(controller.blueBoard[0][0]).toBe('End');
      //Also check that the rest are still undefined
      for (let i = 0; i < BATTLESHIP_ROWS; i++) {
        for (let j = 0; j < BATTLESHIP_COLS; j++) {
          if (!((i === 0 && j == 0) || (i == BATTLESHIP_ROWS - 1 && j === BATTLESHIP_COLS - 1))) {
            expect(controller.blueBoard[i][j]).toBeUndefined();
            expect(controller.greenBoard[i][j]).toBeUndefined();
          }
        }
      }
    });
    it('emits a boardChange event if the board has changed', () => {
      const spy = jest.fn();
      controller.addListener('boardChanged', spy);
      updateGameWithPlacement(controller, { col: 0, gamePiece: 'Blue', row: 0, boat: 'End' });
      expect(spy).toHaveBeenCalledWith(controller.blueBoard);
    });
    it('does not emit a boardChange event if the board has not changed', () => {
      const spy = jest.fn();
      controller.addListener('boardChanged', spy);
      controller.updateFrom(
        { ...controller.toInteractableAreaModel() },
        otherPlayers.concat(ourPlayer),
      );
      expect(spy).not.toHaveBeenCalled();
    });
    it('Calls super.updateFrom with the correct parameters', () => {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore - we are testing spying on a private method
      const spy = jest.spyOn(GameAreaController.prototype, '_updateFrom');
      const model = controller.toInteractableAreaModel();
      controller.updateFrom(model, otherPlayers.concat(ourPlayer));
      expect(spy).toHaveBeenCalledWith(model);
    });
  });

  describe('[T1.3] startGame', () => {
    it('sends a StartGame command to the server', async () => {
      const controller = battleShipAreaControllerWithProps({
        blue: ourPlayer.id,
        green: otherPlayers[0].id,
        status: 'WAITING_TO_START',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();

      mockTownController.sendInteractableCommand.mockClear();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {});
      await controller.startGame();
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'StartGame',
        gameID: instanceID,
      });
    });
    it('Does not catch any errors from the server', async () => {
      const controller = battleShipAreaControllerWithProps({
        blue: ourPlayer.id,
        green: otherPlayers[0].id,
        status: 'WAITING_TO_START',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();

      mockTownController.sendInteractableCommand.mockClear();
      const uniqueError = `Test Error ${nanoid()}`;
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        throw new Error(uniqueError);
      });
      await expect(() => controller.startGame()).rejects.toThrowError(uniqueError);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'StartGame',
        gameID: instanceID,
      });
    });
    it('throws an error if the game is not startable', async () => {
      const controller = battleShipAreaControllerWithProps({
        blue: ourPlayer.id,
        green: otherPlayers[0].id,
        status: 'IN_PROGRESS',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();
      mockTownController.sendInteractableCommand.mockClear();
      await expect(controller.startGame()).rejects.toThrowError();
      expect(mockTownController.sendInteractableCommand).not.toHaveBeenCalled();
    });
    it('throws an error if there is no instanceid', async () => {
      const controller = battleShipAreaControllerWithProps({
        blue: ourPlayer.id,
        green: otherPlayers[0].id,
        status: 'WAITING_TO_START',
      });
      mockTownController.sendInteractableCommand.mockClear();
      await expect(controller.startGame()).rejects.toThrowError();
      expect(mockTownController.sendInteractableCommand).not.toHaveBeenCalled();
    });
  });
});

import _ from 'lodash';
import {
  GameArea,
  GameStatus,
  BattleShipGameState,
  BattleShipColor,
  BattleShipColIndex,
  BattleShipRowIndex,
  BattleShipPiece,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, {
  GameEventTypes,
  NO_GAME_STARTABLE,
  PLAYER_NOT_IN_GAME_ERROR,
} from './GameAreaController';

/**
 * For BattleShipAreaController
 */
export type BattleShipCell = BattleShipPiece | undefined;
export type BattleShipEvents = GameEventTypes & {
  boardChanged: (board: BattleShipCell[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

export const BATTLESHIP_ROWS = 10;
export const BATTLESHIP_COLS = 10;
export const SPACE_FULL_MESSAGE = 'The space is full';

function createEmptyBoard(): BattleShipCell[][] {
  const board = new Array(BATTLESHIP_ROWS);
  for (let i = 0; i < BATTLESHIP_ROWS; i++) {
    board[i] = new Array(BATTLESHIP_COLS).fill(undefined);
  }
  return board;
}

/**
 * This class is responsible for managing the state of the Battle Ship game, and for sending commands to the server
 */
export default class BattleShipAreaController extends GameAreaController<
  BattleShipGameState,
  BattleShipEvents
> {
  protected _blueBoard: BattleShipCell[][] = createEmptyBoard();

  protected _greenBoard: BattleShipCell[][] = createEmptyBoard();

  /**
   * Returns the current state of the blue board.
   *
   * The board is a 10x10 array of BattleShipCell, which is either 'Miss', 'Hit' or undefined.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   */
  get blueBoard(): BattleShipCell[][] {
    return this._blueBoard;
  }

  /**
   * Returns the current state of the green board.
   *
   * The board is a 10x10 array of BattleShipCell, which is either 'Miss', 'Hit', or undefined.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   */
  get greenBoard(): BattleShipCell[][] {
    return this._greenBoard;
  }

  /**
   * Returns the player with the 'Blue' board, if there is one, or undefined otherwise
   */
  get blue(): PlayerController | undefined {
    const blue = this._model.game?.state.blue;
    if (blue) {
      return this.occupants.find(eachOccupant => eachOccupant.id === blue);
    }
    return undefined;
  }

  /**
   * Returns the player with the 'Green' board, if there is one, or undefined otherwise
   */
  get green(): PlayerController | undefined {
    const green = this._model.game?.state.green;
    if (green) {
      return this.occupants.find(eachOccupant => eachOccupant.id === green);
    }
    return undefined;
  }

  /**
   * Returns the player who won the game, if there is one, or undefined otherwise
   */
  get winner(): PlayerController | undefined {
    const winner = this._model.game?.state.winner;
    if (winner) {
      return this.occupants.find(eachOccupant => eachOccupant.id === winner);
    }
    return undefined;
  }

  /**
   * Returns the number of moves that have been made in the game
   */
  get moveCount(): number {
    return this._model.game?.state.moves.length || 0;
  }

  /**
   * Returns true if it is our turn to make a move, false otherwise
   */
  get isOurTurn(): boolean {
    return this.whoseTurn?.id === this._townController.ourPlayer.id;
  }

  /**
   * Returns true if the current player is in the game, false otherwise
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) ?? false;
  }

  /**
   * Returns the color of the current player's board
   * @throws an error with message PLAYER_NOT_IN_GAME_ERROR if the current player is not in the game
   */
  get gamePiece(): BattleShipColor {
    if (this.blue?.id === this._townController.ourPlayer.id) {
      return 'Blue';
    } else if (this.green?.id === this._townController.ourPlayer.id) {
      return 'Green';
    }
    throw new Error(PLAYER_NOT_IN_GAME_ERROR);
  }

  /**
   * Returns the status of the game
   * If there is no game, returns 'WAITING_FOR_PLAYERS'
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_FOR_PLAYERS';
    }
    return status;
  }

  /**
   * Returns the player whose turn it is, if the game is in progress
   * Returns undefined if the game is not in progress
   *
   * Follows the same logic as the backend, respecting the firstPlayer field of the gameState
   */
  get whoseTurn(): PlayerController | undefined {
    const { blue, green } = this;
    if (!blue || !green || this._model.game?.state.status !== 'IN_PROGRESS') {
      return undefined;
    }
    const firstPlayer = this._model.game?.state.firstPlayer;
    if (firstPlayer === 'Blue') {
      if (this.moveCount % 2 === 0) {
        return blue;
      }
      return green;
    } else {
      if (this.moveCount % 2 === 0) {
        return green;
      }
      return blue;
    }
  }

  /**
   * Returns true if the game is empty - no players AND no occupants in the area
   *
   */
  isEmpty(): boolean {
    return !this.blue && !this.green && this.occupants.length === 0;
  }

  /**
   * Returns true if the game is not empty and the game is not waiting for players
   */
  public isActive(): boolean {
    return !this.isEmpty() && this.status !== 'WAITING_FOR_PLAYERS';
  }

  /**
   * Updates the internal state of this BattleShipAreaController based on the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and other
   * common properties (including this._model)
   *
   * If the board has changed, emits a boardChanged event with the new board.
   * If the board has not changed, does not emit a boardChanged event.
   *
   * If the turn has changed, emits a turnChanged event with the new turn (true if our turn, false otherwise)
   * If the turn has not changed, does not emit a turnChanged event.
   */
  protected _updateFrom(newModel: GameArea<BattleShipGameState>): void {
    super._updateFrom(newModel);
    const newGame = newModel.game;
    if (newGame) {
      const gamePiece = this.gamePiece;
      const newBoard = createEmptyBoard();
      let boardToUpdate = gamePiece === 'Blue' ? this._blueBoard : this._greenBoard;
      const boardFromGame =
        gamePiece === 'Blue' ? newGame.state.blueBoard : newGame.state.greenBoard;

      boardFromGame.forEach(piece => {
        newBoard[piece.row][piece.col] = piece.boat;
      });

      if (!_.isEqual(newBoard, boardToUpdate)) {
        boardToUpdate = newBoard;
        this.emit('boardChanged', boardToUpdate);
      }
    }
  }

  /**
   * Sends a request to the server to start the game.
   *
   * If the game is not in the WAITING_TO_START state, throws an error.
   *
   * @throws an error with message NO_GAME_STARTABLE if there is no game waiting to start
   */
  public async startGame(): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'WAITING_TO_START') {
      throw new Error(NO_GAME_STARTABLE);
    }
    await this._townController.sendInteractableCommand(this.id, {
      gameID: instanceID,
      type: 'StartGame',
    });
  }

  /**
   * Places a boat piece in the pre-game phase based on a given row and
   * column.
   * Does not check if placement is valid (invalid if no more pieces to place on board).
   *
   * @throws an error with message NO_GAME_IN_PROGRESS_ERROR if there is no game in progress
   */
  public async placeBoatPiece(row: BattleShipRowIndex, col: BattleShipColIndex): Promise<void> {
    throw new Error('Not implemented');
  }

  /**
   * Sends a request to the server to place a guess from the current player in the given row and column.
   * Does not check if the move is valid.
   *
   * @throws an error with message NO_GAME_IN_PROGRESS_ERROR if there is no game in progress
   *
   * @param row Row to place guess in
   * @param col Column to place guess in
   */
  public async makeMove(row: BattleShipRowIndex, col: BattleShipColIndex): Promise<void> {
    throw new Error('Not implemented');
  }
}

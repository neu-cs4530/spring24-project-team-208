import _ from 'lodash';
import {
  GameArea,
  GameStatus,
  BattleShipGameState,
  BattleShipColor,
  BattleShipColIndex,
  BattleShipRowIndex,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

/**
 * For BattleShipAreaController
 */
export type BattleShipCell = 'Miss' | 'Hit' | 'Boat' | undefined;
export type BattleShipEvents = GameEventTypes & {
  boardChanged: (board: BattleShipCell[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the Battle Ship game, and for sending commands to the server
 */
export default class BattleShipAreaController extends GameAreaController<
  BattleShipGameState,
  BattleShipEvents
> {
  /**
   * Returns the current state of the board.
   *
   * The board is a 10x10 array of BattleShipCell, which is either 'Miss', 'Hit', 'Boat' or undefined.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   */
  get board(): BattleShipCell[][] {
    throw new Error('Not implemented');
  }

  /**
   * Returns the player with the 'Blue' board, if there is one, or undefined otherwise
   */
  get blue(): PlayerController | undefined {
    throw new Error('Not implemented');
  }

  /**
   * Returns the player with the 'Green' board, if there is one, or undefined otherwise
   */
  get green(): PlayerController | undefined {
    throw new Error('Not implemented');
  }

  /**
   * Returns the player who won the game, if there is one, or undefined otherwise
   */
  get winner(): PlayerController | undefined {
    throw new Error('Not implemented');
  }

  /**
   * Returns the number of moves that have been made in the game
   */
  get moveCount(): number {
    throw new Error('Not implemented');
  }

  /**
   * Returns true if it is our turn to make a move, false otherwise
   */
  get isOurTurn(): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Returns true if the current player is in the game, false otherwise
   */
  get isPlayer(): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Returns the color of the current player's board
   * @throws an error with message PLAYER_NOT_IN_GAME_ERROR if the current player is not in the game
   */
  get gamePiece(): BattleShipColor {
    throw new Error('Not implemented');
  }

  /**
   * Returns the status of the game
   * If there is no game, returns 'WAITING_FOR_PLAYERS'
   */
  get status(): GameStatus {
    throw new Error('Not implemented');
  }

  /**
   * Returns the player whose turn it is, if the game is in progress
   * Returns undefined if the game is not in progress
   *
   * Follows the same logic as the backend, respecting the firstPlayer field of the gameState
   */
  get whoseTurn(): PlayerController | undefined {
    throw new Error('Not implemented');
  }

  /**
   * Returns true if the game is empty - no players AND no occupants in the area
   *
   */
  isEmpty(): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Returns true if the game is not empty and the game is not waiting for players
   */
  public isActive(): boolean {
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
  }

  /**
   * Sends a request to the server to start the game.
   *
   * If the game is not in the WAITING_TO_START state, throws an error.
   *
   * @throws an error with message NO_GAME_STARTABLE if there is no game waiting to start
   */
  public async startGame(): Promise<void> {
    throw new Error('Not implemented');
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

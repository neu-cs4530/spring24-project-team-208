import InvalidParametersError, {
  BOARD_POSITION_NOT_VALID_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  BattleShipColor,
  BattleShipGameState,
  BattleShipGuess,
  BattleShipPiece,
  BattleShipPlacement,
  GameMove,
  PlayerID,
} from '../../types/CoveyTownSocket';
import Game from './Game';

const GAME_NOT_WAITING_TO_START_MESSAGE = 'Game is not in waiting to start mode';
const NOT_YOUR_BOARD_MESSAGE = 'Not your board';
const MAX_BOAT_PIECES = 18;

function getOtherPlayerColor(color: BattleShipColor): BattleShipColor {
  if (color === 'Green') {
    return 'Blue';
  }
  return 'Green';
}
/**
 * A BattleShipGame is a Game that implements the rules of Battleship.
 * @see https://en.wikipedia.org/wiki/Battleship_(game)#
 */

export default class BattleShipGame extends Game<BattleShipGameState, BattleShipGuess> {
  private _preferredBlue?: PlayerID;

  private _preferredGreen?: PlayerID;

  /**
   * Creates a new ConnectFourGame.
   * @param priorGame If provided, the new game will be created such that if either player
   * from the prior game joins, they will be the same color. When the game begins, the default
   * first player is blue, but if either player from the prior game joins the new game
   * (and clicks "start"), the first player will be the other color.
   */
  public constructor(priorGame?: BattleShipGame) {
    super({
      moves: [],
      blueBoard: [],
      greenBoard: [],
      status: 'WAITING_FOR_PLAYERS',
      firstPlayer: getOtherPlayerColor(priorGame?.state.firstPlayer || 'Green'),
    });
    this._preferredBlue = priorGame?.state.blue;
    this._preferredGreen = priorGame?.state.green;
  }

  /**
   * Joins a player to the game.
   * - Assigns the player to a color (blue or green). If the player was in the prior game, then attempts
   * to reuse the same color if it is not in use. Otherwise, assigns the player to the first
   * available color (blue, then green).
   * - If both players are now assigned, updates the game status to WAITING_TO_START.
   *
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the game is full (GAME_FULL_MESSAGE)
   *
   * @param player the player to join the game
   */
  // TODO: currently no first player logic implemented. Only basic functionality implemented
  // so place boats and start game can be tested. Add first player + any other additional functionality
  // later
  protected _join(player: Player): void {
    if (this.state.blue === player.id || this.state.green === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.blue) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        blue: player.id,
      };
    } else if (!this.state.green) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        green: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }

    if (this.state.blue && this.state.green) {
      this.state.status = 'WAITING_TO_START';
    }
  }

  /**
   * Removes valid boats if they are in the correct order (contain a front and end
   * piece from left to right or from top to bottom).
   *
   * @param hasFront
   * @param row
   * @param col
   * @param nextRow
   * @param nextCol
   * @param board
   */
  private _removeValidBoats(
    hasFront: boolean,
    row: number,
    col: number,
    nextRow: number,
    nextCol: number,
    board: (BattleShipPiece | undefined)[][],
  ): boolean {
    const currPiece = board[row][col];
    if (hasFront && currPiece === undefined) {
      hasFront = false;
    }
    if (currPiece === 'Front' && board[nextRow][nextCol] !== undefined) {
      board[row][col] = undefined;
      hasFront = true;
    }
    if (hasFront && currPiece === 'End') {
      board[row][col] = undefined;
      hasFront = false;
    }
    if (hasFront && currPiece === 'Middle') {
      board[row][col] = undefined;
    }
    return hasFront;
  }

  /**
   * Determines if the finalized pre-game board consists of only valid boats.
   * A board is valid if it has a start and end piece for every boat and
   * has the correct number of boat pieces. If incorrect, player will have
   * to reposition their boats to start the game
   */
  protected _isValidBoard(boardPlacements: BattleShipPlacement[]): boolean {
    const numRows = 10;
    const numCols = 10;

    // Convert pieces to board
    const board: (BattleShipPiece | undefined)[][] = new Array(numRows);
    for (let i = 0; i < board.length; i++) {
      board[i] = new Array(numCols).fill(undefined);
    }

    for (const piece of boardPlacements) {
      board[piece.row][piece.col] = piece.boat;
    }

    let hasFront = false;
    // check if all vertical boats have a front and end piece
    for (let col = 0; col < board[0].length; col++) {
      for (let row = 0; row < board.length - 1; row++) {
        hasFront = this._removeValidBoats(hasFront, row, col, row + 1, col, board);
      }
      hasFront = false;
    }

    // check if all horizontal boats have a front and end piece
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length - 1; col++) {
        hasFront = this._removeValidBoats(hasFront, row, col, row, col + 1, board);
      }
      hasFront = false;
    }

    // false if there are any non-undefined pieces left or if number of boat pieces is incorrect
    return (
      board.every(row => row.every(col => col === undefined)) &&
      boardPlacements.length === MAX_BOAT_PIECES
    );
  }

  /**
   * Indicates that a player is ready to start the game.
   *
   * Updates the game state to indicate that the player is ready to start the game.
   *
   * If both players are ready, the game will start.
   *
   * The first player (blue or green) is determined as follows:
   *   - If neither player was in the last game in this area (or there was no prior game), the first player is red.
   *   - If at least one player was in the last game in this area, then the first player will be the other color from last game.
   *   - If a player from the last game *left* the game and then joined this one, they will be treated as a new player (not given the same color by preference).
   *
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the game is not in the WAITING_TO_START state (GAME_NOT_STARTABLE_MESSAGE)
   * @throws InvalidParametersError if player has not placed all boats yet during pre-game phase (GAME_NOT_STARTABLE_MESSAGE)
   * @throws Invalid ParametersError if player has placed boats in an invalid order (GAME_NOT_STARTABLE_MESSAGE);
   *
   * @param player The player who is ready to start the game
   */
  public startGame(player: Player): void {
    if (
      this.state.status !== 'WAITING_TO_START' ||
      (this.state.blue === player.id && !this._isValidBoard(this.state.blueBoard)) ||
      (this.state.green === player.id && !this._isValidBoard(this.state.greenBoard))
    ) {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }
    if (this.state.blue !== player.id && this.state.green !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.blue === player.id) {
      this.state.blueReady = true;
    }
    if (this.state.green === player.id) {
      this.state.greenReady = true;
    }
    // if none of the players from the last game are in this game, then the first
    // player is blue
    if (!(this._preferredBlue === this.state.blue || this._preferredGreen === this.state.green)) {
      this.state.firstPlayer = 'Blue';
    }
    this.state = {
      ...this.state,
      status: this.state.blueReady && this.state.greenReady ? 'IN_PROGRESS' : 'WAITING_TO_START',
    };
  }

  /**
   * Ensures that boat placement is valid given the current state of the game
   * Follows the rules of "Battle Ship"
   * @param placement
   */
  protected _validatePlacement(placement: BattleShipPlacement): void {
    let board;
    if (placement.boardColor === 'Blue') {
      board = this.state.blueBoard;
    } else {
      board = this.state.greenBoard;
    }

    // A placement is invalid if the maximum number of boat pieces have been placed
    if (board.length >= MAX_BOAT_PIECES) {
      throw new InvalidParametersError(BOARD_POSITION_NOT_VALID_MESSAGE);
    }
    // A placement is invalid if the given position (row, col) is full
    if (board.filter(p => p.col === placement.col && p.row === placement.row).length > 0) {
      throw new InvalidParametersError(BOARD_POSITION_NOT_VALID_MESSAGE);
    }
  }

  /**
   * Places a boat piece onto a board
   * @param placement
   */
  protected _place(placement: BattleShipPlacement) {
    let board;
    if (placement.boardColor === 'Blue') {
      board = this.state.blueBoard;
    } else {
      board = this.state.greenBoard;
    }
    const newPlacement = [...board, placement];
    const newState: BattleShipGameState = {
      ...this.state,
      ...(placement.boardColor === 'Blue' && { blueBoard: newPlacement }),
      ...(placement.boardColor === 'Green' && { greenBoard: newPlacement }),
    };
    this.state = newState;
  }

  /**
   * Creates a new battle ship placement, if possible. Throws errors if invalid.
   *
   * @param position
   * @returns newPlacement
   */
  protected _createBattleShipPlacement(position: GameMove<BattleShipPlacement>) {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_WAITING_TO_START_MESSAGE);
    }
    if (
      (position.playerID === this.state.blue && position.move.boardColor !== 'Blue') ||
      (position.playerID === this.state.green && position.move.boardColor !== 'Green')
    ) {
      throw new InvalidParametersError(NOT_YOUR_BOARD_MESSAGE);
    }

    let gamePiece: BattleShipColor;
    if (position.playerID === this.state.blue) {
      gamePiece = 'Blue';
    } else if (position.playerID === this.state.green) {
      gamePiece = 'Green';
    } else {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }

    const newPlacement = {
      boardColor: gamePiece,
      boat: position.move.boat,
      col: position.move.col,
      row: position.move.row,
    };

    return newPlacement;
  }

  /**
   * Places a ship piece on the board based on a given BattleShipPlacement.
   * Uses player’s ID to determine which color board they are playing as
   * (ignores move.gamePiece).
   *
   * Validates the position (valid boat is handled in start game), and, if
   * it is valid, applies it to the board.
   *
   * @param position The position attempt to apply, from leftmost corner
   *
   * @throws InvalidParametersError if the game is not in WAITING_TO_START mode (GAME_NOT_IN_WAITING_TO_START_MESSAGE)
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the position is invalid per the rules of BattleShip (BOARD_POSITION_NOT_VALID_MESSAGE)
   * @throws InvalidParametersError if the maximum number of boat pieces has been added to the board (BOARD_POSITION_NOT_VALID_MESSAGE)
   * @throws InvalidParametersError if trying to place on board that isn't theirs (NOT_YOUR_BOARD_MESSAGE)
   */
  public placeBoat(position: GameMove<BattleShipPlacement>): void {
    const newPlacement = this._createBattleShipPlacement(position);
    this._validatePlacement(newPlacement);
    this._place(newPlacement);
  }

  /**
   * Removes a boat piece from a board
   * @param placement
   */
  protected _remove(removal: BattleShipPlacement) {
    let board;
    if (removal.boardColor === 'Blue') {
      board = this.state.blueBoard.filter(p => p.col !== removal.col || p.row !== removal.row);
    } else {
      board = this.state.greenBoard.filter(p => p.col !== removal.col || p.row !== removal.row);
    }
    const newState: BattleShipGameState = {
      ...this.state,
      ...(removal.boardColor === 'Blue' && { blueBoard: board }),
      ...(removal.boardColor === 'Green' && { greenBoard: board }),
    };
    this.state = newState;
  }

  /**
   * Removes a ship piece (if possible) from the board based on a given BattleShipPlacement.
   * Uses player’s ID to determine which color board they are playing as. If no boat is available
   * to be removed, ignores player's request.
   * (ignores move.gamePiece and position.boat).
   *
   * @throws InvalidParametersError if the game is not in WAITING_TO_START mode (GAME_NOT_IN_WAITING_TO_START_MESSAGE)
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if trying to place on board that isn't theirs (NOT_YOUR_BOARD_MESSAGE)
   *
   * @param position The reposition attempt to apply, from leftmost corner
   */
  public removeBoat(position: GameMove<BattleShipPlacement>): void {
    const newPlacement = this._createBattleShipPlacement(position);
    this._remove(newPlacement);
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   *
   * If the game state is currently "IN_PROGRESS", updates the game's status to OVER and sets the winner to the other player.
   *
   * If the game state is currently "ARRANGING_BOATS", updates the game's status to WAITING_FOR_PLAYERS.
   *
   * If the game state is currently "WAITING_FOR_PLAYERS" or "OVER", the game state is unchanged.
   *
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   *
   * @param player The player to remove from the game
   */
  protected _leave(player: Player): void {
    throw new Error('Method not implemented.');
  }

  /**
   * TODO: Specify and implement this method.
   * @param move
   */
  public applyMove(move: GameMove<BattleShipGuess>): void {
    throw new Error('Method not implemented.');
  }
}

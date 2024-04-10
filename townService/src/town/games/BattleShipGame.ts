import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_MOVE_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  BattleShipColIndex,
  BattleShipRowIndex,
  BattleShipColor,
  BattleShipGameState,
  BattleShipGuess,
  BattleShipCell,
  BattleShipPlacement,
  GameMove,
  PlayerID,
  BattleShipBoatPiece,
  BattleShipCellState,
} from '../../types/CoveyTownSocket';
import Game from './Game';

const NOT_YOUR_BOARD_MESSAGE = 'Not your board';
const MAX_BOAT_PIECES = 15;
const BATTLESHIP_COLS = 10;
const BATTLESHIP_ROWS = 10;
const ALL_BOATS: string[] = [
  'Aircraft_Back',
  'Aircraft_Middle_1',
  'Aircraft_Middle_2',
  'Aircraft_Front',
  'Battleship_Back',
  'Battleship_Middle_1',
  'Battleship_Middle_2',
  'Battleship_Middle_3',
  'Battleship_Front',
  'Cruiser_Back',
  'Cruiser_Front',
  'Destroyer',
  'Submarine_Back',
  'Submarine_Middle',
  'Submarine_Front',
];

const BOAT_MAP = [
  {
    name: 'Battleship',
    ships: [
      'Battleship_Back',
      'Battleship_Middle_1',
      'Battleship_Middle_2',
      'Battleship_Middle_3',
      'Battleship_Front',
    ],
  },
  {
    name: 'Aircraft Carrier',
    ships: ['Aircraft_Back', 'Aircraft_Middle_1', 'Aircraft_Middle_2', 'Aircraft_Front'],
  },
  {
    name: 'Submarine',
    ships: ['Submarine_Back', 'Submarine_Middle', 'Submarine_Front'],
  },
  {
    name: 'Cruiser',
    ships: ['Cruiser_Back', 'Cruiser_Front'],
  },
  {
    name: 'Destroyer',
    ships: ['Destroyer'],
  },
];

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
      theme: 'Military',
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
  protected _join(player: Player): void {
    if (this.state.green === player.id || this.state.blue === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (this._preferredBlue === player.id && !this.state.blue) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        blue: player.id,
      };
    } else if (this._preferredGreen === player.id && !this.state.green) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        green: player.id,
      };
    } else if (!this.state.blue) {
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
  private _isValidBoat(
    hasFront: boolean,
    row: number,
    col: number,
    nextRow: number,
    nextCol: number,
    board: (BattleShipCell | undefined)[][],
  ): boolean {
    const boatFronts = [
      'Aircraft_Front',
      'Battleship_Front',
      'Cruiser_Front',
      'Destroyer',
      'Submarine_Front',
    ];
    const boatBacks = [
      'Aircraft_Back',
      'Battleship_Back',
      'Cruiser_Back',
      'Destroyer',
      'Submarine_Back',
    ];
    const currPiece = board[row][col];
    if (hasFront && currPiece === undefined) {
      hasFront = false;
    }
    if (currPiece && boatFronts.includes(currPiece.type) && board[nextRow][nextCol] !== undefined) {
      board[row][col] = undefined;
      hasFront = true;
    }
    if (hasFront && currPiece && boatBacks.includes(currPiece.type)) {
      board[row][col] = undefined;
      hasFront = false;
    }
    if (
      hasFront &&
      currPiece &&
      (![...boatFronts, ...boatBacks].includes(currPiece.type) || currPiece.type === 'Destroyer')
    ) {
      board[row][col] = undefined;
    }
    return hasFront;
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
    if (this.state.status !== 'WAITING_TO_START') {
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
      status: this.state.blueReady && this.state.greenReady ? 'PLACING_BOATS' : 'WAITING_TO_START',
      blueBoard: this._createNewBoard(),
      greenBoard: this._createNewBoard(),
    };

    // reset for use in boat placement phase
    if (this.state.blueReady && this.state.greenReady) {
      this.state.blueReady = false;
      this.state.greenReady = false;
    }
  }

  protected _createNewBoard(): Array<BattleShipCell> {
    const newBoard: Array<BattleShipCell> = Array.from({ length: 100 }, (_, index) => ({
      type: 'Ocean',
      state: 'Safe',
      row: Math.floor(index / BATTLESHIP_ROWS) as BattleShipRowIndex,
      col: (index % BATTLESHIP_COLS) as BattleShipColIndex,
    }));

    return newBoard;
  }

  /**
   * Ensures that boat placement is valid given the current state of the game
   * Follows the rules of "Battle Ship"
   * @param placement
   */
  protected _validatePlacement(placement: BattleShipPlacement, vertical: boolean): boolean {
    let board: BattleShipCell[];
    if (placement.gamePiece === 'Blue') {
      board = this.state.blueBoard;
    } else {
      board = this.state.greenBoard;
    }
    const boatLength = BOAT_MAP.find(boat => boat.name === placement.cell)?.ships.length || 0;

    // A placement is invalid if the maximum number of boat pieces have been placed
    if (board.filter(p => p.type !== 'Ocean').length >= MAX_BOAT_PIECES) {
      return false;
    }
    // A placement is invalid if the given position (row, col) is full
    if (
      board.find(cell => cell.col === placement.col && cell.row === placement.row)?.type !== 'Ocean'
    ) {
      return false;
    }
    // A placement is invalid if a vertical boat would be out of bounds
    if (vertical && placement.row + boatLength > BATTLESHIP_ROWS) {
      return false;
    }
    // A placement is invalid if a horizontal boat would be out of bounds
    if (!vertical && placement.col + boatLength > BATTLESHIP_COLS) {
      return false;
    }

    // A placement is invlaid if a vertical boat would collide with another boat
    if (vertical) {
      for (let row = 0 + placement.row; row < placement.row + boatLength; row++) {
        if (board.find(cell => cell.row === row && cell.col === placement.col)?.type !== 'Ocean') {
          return false;
        }
      }
    }
    // A placement is invlaid if a horizontal boat would collide with another boat
    if (!vertical) {
      for (let col = 0 + placement.col; col < placement.col + boatLength; col++) {
        if (board.find(cell => cell.row === placement.row && cell.col === col)?.type !== 'Ocean') {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Places a boat piece onto a board
   * @param placement
   */
  protected _place(placement: BattleShipPlacement) {
    let board;
    if (placement.gamePiece === 'Blue') {
      board = this.state.blueBoard;
    } else {
      board = this.state.greenBoard;
    }
    const oldIndex = board.findIndex(
      (piece: BattleShipCell) => piece.col === placement.col && piece.row === placement.row,
    );
    const newPlacement = [...board];
    newPlacement[oldIndex] = {
      type: placement.cell as BattleShipBoatPiece,
      state: 'Safe',
      row: placement.row,
      col: placement.col,
    };

    const newState: BattleShipGameState = {
      ...this.state,
      ...(placement.gamePiece === 'Blue' && { blueBoard: newPlacement }),
      ...(placement.gamePiece === 'Green' && { greenBoard: newPlacement }),
    };
    this.state = newState;

    // if there are no more boats to place player is ready for game phase
    if (this._allBoatsPlaced(newPlacement)) {
      if (placement.gamePiece === 'Blue') {
        this.state.blueReady = true;
      } else {
        this.state.greenReady = true;
      }
    }
    // if both players are ready for game phase set status to IN_PROGRESS
    if (this.state.blueReady && this.state.greenReady) {
      this.state.status = 'IN_PROGRESS';
    }
  }

  /**
   * Checks if all availible boats in a board have been placed and returns a boolean of the result
   * @param newPlacement the board to check
   */
  protected _allBoatsPlaced(newPlacement: Array<BattleShipCell>): boolean {
    const stripTheme = (boat: string) => {
      const newBoat: string[] = boat.split('_');
      newBoat.pop();
      const newBoatStr = newBoat.join('_');
      return newBoatStr;
    };
    const boatArr = newPlacement
      .filter(cell => cell.type !== 'Ocean')
      .map(cell => stripTheme(cell.type));

    return ALL_BOATS.every((item: string) => boatArr.includes(item));
  }

  /**
   * Creates a new battle ship placement, if possible. Throws errors if invalid.
   *
   * @param position
   * @returns newPlacement
   */
  protected _battleShipPlacement(position: GameMove<BattleShipPlacement>): BattleShipPlacement {
    if (this.state.status !== 'PLACING_BOATS') {
      throw new InvalidParametersError('Game is not in placement phase');
    }
    if (
      (position.playerID === this.state.blue && position.move.gamePiece !== 'Blue') ||
      (position.playerID === this.state.green && position.move.gamePiece !== 'Green')
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
      gamePiece,
      cell: position.move.cell,
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
  public placeBoat(position: GameMove<BattleShipPlacement>, vertical: boolean): void {
    const newPlacement = this._battleShipPlacement(position);
    if (this._validatePlacement(newPlacement, vertical)) {
      BOAT_MAP.find(boatM => boatM.name === position.move.cell)?.ships.map((ship, index) =>
        this._place({
          gamePiece: position.playerID === this.state.blue ? 'Blue' : 'Green',
          cell: `${ship}_${this.state.theme}` as BattleShipBoatPiece,
          col: (position.move.col + (vertical ? 0 : index)) as BattleShipColIndex,
          row: (position.move.row + (vertical ? index : 0)) as BattleShipRowIndex,
        }),
      );
    } else {
      throw new Error(INVALID_MOVE_MESSAGE);
    }
  }

  /**
   * Removes a boat piece from a board
   * @param placement
   */
  protected _remove(removal: BattleShipPlacement) {
    let board;
    if (removal.gamePiece === 'Blue') {
      board = this.state.blueBoard.filter(p => p.col !== removal.col || p.row !== removal.row);
      board = this.state.blueBoard.concat({
        row: removal.row,
        col: removal.col,
        type: 'Ocean',
        state: 'Safe',
      });
    } else {
      board = this.state.greenBoard.filter(p => p.col !== removal.col || p.row !== removal.row);
      board = this.state.greenBoard.concat({
        row: removal.row,
        col: removal.col,
        type: 'Ocean',
        state: 'Safe',
      });
    }
    const newState: BattleShipGameState = {
      ...this.state,
      ...(removal.gamePiece === 'Blue' && { blueBoard: board }),
      ...(removal.gamePiece === 'Green' && { greenBoard: board }),
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
    const newPlacement = this._battleShipPlacement(position);
    this._remove(newPlacement);
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   *
   * If the game state is currently "IN_PROGRESS", updates the game's status to OVER and sets the winner to the other player.
   *
   * If the game state is currently "WAITING_TO_START", updates the game's status to WAITING_FOR_PLAYERS.
   *
   * If the game state is currently "WAITING_FOR_PLAYERS" or "OVER", the game state is unchanged.
   *
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   *
   * @param player The player to remove from the game
   */
  protected _leave(player: Player): void {
    if (this.state.status === 'OVER') {
      return;
    }
    const removePlayer = (playerID: string): BattleShipColor => {
      if (this.state.blue === playerID) {
        this.state = {
          ...this.state,
          blue: undefined,
          blueReady: false,
          blueBoard: [],
        };
        return 'Blue';
      }
      if (this.state.green === playerID) {
        this.state = {
          ...this.state,
          green: undefined,
          greenReady: false,
          greenBoard: [],
        };
        return 'Green';
      }
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    };
    switch (this.state.status) {
      case 'WAITING_TO_START':
        removePlayer(player.id);
        this.state.status = 'WAITING_FOR_PLAYERS';
        break;
      case 'WAITING_FOR_PLAYERS':
        removePlayer(player.id);
        break;
      case 'IN_PROGRESS':
        this.state.status = 'OVER';
        this.state.winner = this.state.blue === player.id ? this.state.green : this.state.blue;
        break;
      case 'PLACING_BOATS':
        this.state.status = 'OVER';
        this.state.winner = this.state.blue === player.id ? this.state.green : this.state.blue;
        break;
      default:
        // This behavior can be undefined :)
        throw new Error(`Unexpected game status: ${this.state.status}`);
    }
  }

  /**
   * Ensures that "guess" is valid given the current state of the game
   * Follows the rules of "Battleship"
   * @param move
   */
  protected _validateGuess(move: BattleShipGuess): void {
    // A guess is invalid if the player is not the current player
    let nextPlayer: BattleShipColor;
    if (this.state.firstPlayer === 'Blue') {
      nextPlayer = this.state.moves.length % 2 === 0 ? 'Blue' : 'Green';
    } else {
      nextPlayer = this.state.moves.length % 2 === 0 ? 'Green' : 'Blue';
    }
    if (move.gamePiece !== nextPlayer) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    }
  }

  /*
    Returns true all the ships on the given board have been hit
  */
  private _gameIsWon(board: BattleShipCell[]): boolean {
    let safeTiles = 0;
    board.forEach((cell: BattleShipCell) => {
      if (cell.type !== 'Ocean' && cell.state === 'Safe') {
        safeTiles++;
      }
    });

    return safeTiles === 0;
  }

  protected _applyMove(move: BattleShipGuess) {
    const newMoves = [...this.state.moves, move];
    const boardToChange = move.gamePiece === 'Blue' ? this.state.greenBoard : this.state.blueBoard;

    const newBoard = boardToChange.map((cell: BattleShipCell) => {
      if (cell.row === move.row && cell.col === move.col) {
        return { ...cell, state: 'Hit' as BattleShipCellState };
      }
      return cell;
    });

    const newState: BattleShipGameState = {
      ...this.state,
      ...(move.gamePiece === 'Green' && { blueBoard: newBoard }),
      ...(move.gamePiece === 'Blue' && { greenBoard: newBoard }),
      moves: newMoves,
    };

    if (this._gameIsWon(newBoard)) {
      newState.status = 'OVER';
      newState.winner = move.gamePiece === 'Blue' ? this.state.blue : this.state.green;
    }
    this.state = newState;
  }

  /**
   * Applies a guess to the game.
   * Uses the player's ID to determine which color they are playing as (ignores move.gamePiece).
   *
   * Validates the move, and if it is valid, applies it to the game state.
   *
   * If the move ends the game, updates the game state to reflect the end of the game,
   * setting the status to "OVER" and the winner to the player who won
   *
   * @param move The move to attempt to apply
   *
   * @throws InvalidParametersError if the game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
   *
   */
  public applyMove(move: GameMove<BattleShipGuess>): void {
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    let gamePiece: BattleShipColor;
    if (move.playerID === this.state.blue) {
      gamePiece = 'Blue';
    } else if (move.playerID === this.state.green) {
      gamePiece = 'Green';
    } else {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    const newMove = {
      gamePiece,
      row: move.move.row,
      col: move.move.col,
    };
    this._validateGuess(newMove);
    this._applyMove(newMove);
  }
}

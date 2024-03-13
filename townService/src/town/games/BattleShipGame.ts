import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  BattleShipColor,
  BattleShipGameState,
  BattleShipGuess,
  GameMove,
  PlayerID,
} from '../../types/CoveyTownSocket';
import Game from './Game';

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
   * Indicates that a player is ready to start the game.
   *
   * Updates the game state to indicate that the player is ready to start the game.
   *
   * If both players are ready, the game will start.
   *
   * The first player (blue or green) is determined as follows:
   *   - If neither player was in the last game in this area (or there was no prior game), the first player is red.
   *   - If at least one player was in the last game in this area, then the first player will be the other color from last game.
   *   - If a player from the last game *left* the game and then joined this one, they will be treated as a new player (not given the same color by preference).   *
   *
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the game is not in the WAITING_TO_START state (GAME_NOT_STARTABLE_MESSAGE)
   *
   * @param player The player who is ready to start the game
   */
  public startGame(player: Player): void {
    throw new Error('Method not implemented.');
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
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
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
        };
        return 'Blue';
      }
      if (this.state.green === playerID) {
        this.state = {
          ...this.state,
          green: undefined,
          greenReady: false,
        };
        return 'Green';
      }
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    };
    const color = removePlayer(player.id);
    switch (this.state.status) {
      case 'WAITING_TO_START':
      case 'WAITING_FOR_PLAYERS':
        // no-ops: nothing needs to happen here
        this.state.status = 'WAITING_FOR_PLAYERS';
        break;
      case 'IN_PROGRESS':
        this.state = {
          ...this.state,
          status: 'OVER',
          winner: color === 'Blue' ? this.state.green : this.state.blue,
        };
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
    if (move.boardColor !== nextPlayer) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    }
  }

  /**
   * TODO: Specify and implement this method.
   * @param move
   */
  public applyMove(move: GameMove<BattleShipGuess>): void {
    throw new Error('Method not implemented.');
  }
}

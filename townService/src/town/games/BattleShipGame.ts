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
    throw new Error('Method not implemented.');
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
   * @throws InvalidParametersError if the game is not in the ARRANGING_BOATS state (GAME_NOT_STARTABLE_MESSAGE)
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
   * If the game state is currently "ARRANGING_BOATS", updates the game's status to WAITING_FOR_PLAYERS.
   *
   * If the game state is currently "WAITING_FOR_PLAYERS" or "OVER", the game state is unchanged.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
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

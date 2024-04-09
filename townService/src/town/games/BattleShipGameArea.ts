import GameArea from './GameArea';
import BattleShipGame from './BattleShipGame';
import Player from '../../lib/Player';
import {
  InteractableType,
  InteractableCommand,
  InteractableCommandReturnType,
  BattleShipGameState,
  GameInstance,
  BattleShipDatabaseEntry,
} from '../../types/CoveyTownSocket';
import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import db from '../../lib/firebaseData';

const DEFAULT_ELO = 1000;

/**
 * A BattleShipGameArea is a GameArea that hosts a BattleShipGame.
 *
 * @see BattleShipGame
 * @see GameArea
 */
export default class BattleShipGameArea extends GameArea<BattleShipGame> {
  protected getType(): InteractableType {
    return 'BattleShipArea';
  }

  private _updatedElo(playerElo: number, opponentElo: number, won: boolean): number {
    const expectedScore = 1 / (1 + 10 ** ((opponentElo - playerElo) / 400));
    const realScore = won ? 1 : 0;
    return playerElo + 32 * (realScore - expectedScore);
  }

  private async _updatePlayerStats(playerName: string, won: boolean, opponentName: string) {
    try {
      const playerDocRef = db.collection('battleship').doc(playerName);
      const opponentDocRef = db.collection('battleship').doc(opponentName);
      const playerDoc = await playerDocRef.get();
      const opponentDoc = await opponentDocRef.get();
      const playerData = playerDoc.data();
      const opponentData = opponentDoc.data();

      if (!playerData || !opponentData) {
        throw new Error(
          'A document in the database should have been made for the players when they joined the game',
        );
      }
      const updatedData: BattleShipDatabaseEntry = {
        wins: won ? playerData.wins + 1 : playerData.wins,
        losses: won ? playerData.losses : playerData.losses + 1,
        elo: this._updatedElo(playerData.elo, opponentData.elo, won),
        history: [{ opponent: opponentName, result: won ? 'win' : 'loss' }, ...playerData.history],
      };

      playerDocRef.set(updatedData);
    } catch (error) {
      throw new Error(`Error updating player stats: ${error}`);
    }
  }

  private async _updateDatabase(blueName: string, greenName: string, winner: string) {
    await this._updatePlayerStats(blueName, winner === blueName, greenName);
    await this._updatePlayerStats(greenName, winner === greenName, blueName);
  }

  private async _stateUpdated(updatedState: GameInstance<BattleShipGameState>) {
    if (updatedState.state.status === 'OVER') {
      // If we haven't yet recorded the outcome, do so now.
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
        const { blue, green, winner } = updatedState.state;
        if (blue && green && winner) {
          const blueName =
            this._occupants.find(eachPlayer => eachPlayer.id === blue)?.userName || blue;
          const greenName =
            this._occupants.find(eachPlayer => eachPlayer.id === green)?.userName || green;
          this._history.push({
            gameID,
            scores: {
              [blueName]: updatedState.state.winner === blue ? 1 : 0,
              [greenName]: updatedState.state.winner === green ? 1 : 0,
            },
          });
          this._emitAreaChanged();
          await this._updateDatabase(blueName, greenName, winner);
        } else {
          throw new Error('Game is over, but the game state is not properly set.');
        }
      }
    } else {
      this._emitAreaChanged();
    }
  }

  private async _makeDefaultDatabaseEntry(playerName: string) {
    try {
      const playerDocRef = db.collection('battleship').doc(playerName);
      const playerDoc = await playerDocRef.get();

      if (!playerDoc.exists) {
        playerDocRef.set({
          wins: 0,
          losses: 0,
          elo: DEFAULT_ELO,
          history: [],
        });
      }
    } catch (error) {
      throw new Error(`Error creating default database entry: ${error}`);
    }
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - StartGame (indicates that the player is ready to start the game)
   * - GameMove (applies a move to the game)
   * - SetUpGameMove (applies a set up move before the game starts)
   * - LeaveGame (leaves the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - StartGame, GameMove, SetUpGameMove and LeaveGame: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *    or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides JoinGame, StartGame, GameMove, SetUpGameMove and LeaveGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'SetUpGameMove') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      if (command.placement.gamePiece !== 'Blue' && command.placement.gamePiece !== 'Green') {
        throw new InvalidParametersError('Invalid game piece');
      }
      game.placeBoat(
        {
          gameID: command.gameID,
          playerID: player.id,
          move: command.placement,
        },
        command.vertical,
      );
      this._stateUpdated(game.toModel());

      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'GameMove') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      if (command.move.gamePiece !== 'Blue' && command.move.gamePiece !== 'Green') {
        throw new InvalidParametersError('Invalid game piece');
      }
      game.applyMove({
        gameID: command.gameID,
        playerID: player.id,
        move: command.move,
      });
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        // No game in progress, make a new one
        game = new BattleShipGame(this._game);
        this._game = game;
      }
      this._makeDefaultDatabaseEntry(player.userName);
      game.join(player);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'StartGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.startGame(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}

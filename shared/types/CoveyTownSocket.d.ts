export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: TypedInteractable[];
}

export type InteractableType = 'ConversationArea' | 'ViewingArea' | 'TicTacToeArea' | 'ConnectFourArea' | 'BattleShipArea';
export interface Interactable {
  type: InteractableType;
  id: InteractableID;
  occupants: PlayerID[];
}

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type Direction = 'front' | 'back' | 'left' | 'right';

export type PlayerID = string;
export interface Player {
  id: PlayerID;
  userName: string;
  location: PlayerLocation;
};

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
  interactableID?: string;
};

export interface ConversationArea extends Interactable {
  topic?: string;
};
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ViewingArea extends Interactable {
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export type GameStatus = 'IN_PROGRESS' | 'WAITING_TO_START' | 'OVER' | 'WAITING_FOR_PLAYERS' | 'PLACING_BOATS';
/**
 * Base type for the state of a game
 */
export interface GameState {
  status: GameStatus;
} 

/**
 * Type for the state of a game that can be won
 */
export interface WinnableGameState extends GameState {
  winner?: PlayerID;
}
/**
 * Base type for a move in a game. Implementers should also extend MoveType
 * @see MoveType
 */
export interface GameMove<MoveType> {
  playerID: PlayerID;
  gameID: GameInstanceID;
  move: MoveType;
}

export type TicTacToeGridPosition = 0 | 1 | 2;

/**
 * Type for a move in TicTacToe
 */
export interface TicTacToeMove {
  gamePiece: 'X' | 'O';
  row: TicTacToeGridPosition;
  col: TicTacToeGridPosition;
}

/**
 * Type for the state of a TicTacToe game
 * The state of the game is represented as a list of moves, and the playerIDs of the players (x and o)
 * The first player to join the game is x, the second is o
 */
export interface TicTacToeGameState extends WinnableGameState {
  moves: ReadonlyArray<TicTacToeMove>;
  x?: PlayerID;
  o?: PlayerID;
}

/**
 * Type for the state of a ConnectFour game.
 * The state of the game is represented as a list of moves, and the playerIDs of the players (red and yellow)
 */
export interface ConnectFourGameState extends WinnableGameState {
  // The moves in this game
  moves: ReadonlyArray<ConnectFourMove>;
  // The playerID of the red player, if any
  red?: PlayerID;
  // The playerID of the yellow player, if any
  yellow?: PlayerID;
  // Whether the red player is ready to start the game
  redReady?: boolean;
  // Whether the yellow player is ready to start the game
  yellowReady?: boolean;
  // The color of the player who will make the first move
  firstPlayer: ConnectFourColor;
}

/**
 * Type for a move in ConnectFour
 * Columns are numbered 0-6, with 0 being the leftmost column
 * Rows are numbered 0-5, with 0 being the top row
 */
export interface ConnectFourMove {
  gamePiece: ConnectFourColor;
  col: ConnectFourColIndex;
  row: ConnectFourRowIndex;
}

/**
 * Row indices in ConnectFour start at the top of the board and go down
 */
export type ConnectFourRowIndex = 0 | 1 | 2 | 3 | 4 | 5;
/**
 * Column indices in ConnectFour start at the left of the board and go right
 */
export type ConnectFourColIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ConnectFourColor = 'Red' | 'Yellow';

/**
 * Type for the state of a BattleShip game.
 * The state of the game is represented as a list of moves, and the playerIDs of the players (blue and green)
 */
export interface BattleShipGameState extends WinnableGameState {
  // The moves in this game
  moves: ReadonlyArray<BattleShipGuess>;
  // The blue player's board
  blueBoard: Array<BattleShipCell>;
  // The green player's board
  greenBoard: Array<BattleShipCell>;
  // The playerID of the blue player, if any
  blue?: PlayerID;
  // The playerID of the green player, if any
  green?: PlayerID;
  // Whether the blue player is ready to start placement phase, then if the player is ready to start game phase
  blueReady?: boolean;
  // Whether the green player is ready to start placement phase, then if the player is ready to start game phase
  greenReady?: boolean;
  // The color of the player who will make the first move
  firstPlayer: BattleShipColor;
}

/**
 * Type for a move in BattleShip
 * Gamepiece is which player is making a guess
 * Columns are lettered A-J, with A being the leftmost column
 * Rows are numbered 0-9, with 0 being the top row
 */
export interface BattleShipGuess {
  gamePiece: BattleShipColor;
  col: BattleShipColIndex;
  row: BattleShipRowIndex;
}

// The size of each cell square (in pixels)
// export const Cell_SIZE = 40

/**
 * Type for repositioning a boat in BattleShip during pre-game phase
 * Gamepiece is which player is making a placement
 * Cell is which boat the player wants to place
 * Columns are lettered A-J, with A being the leftmost column
 * Rows are numbered 0-9, with 0 being the top row
 */
export interface BattleShipPlacement { 
  gamePiece: BattleShipColor;
  cell: BattleshipBoat;
  col: BattleShipColIndex;
  row: BattleShipRowIndex;
}

/**
 * Row indices in BattleShip start at the top of the board and go down.
 * Represented as A-J to users.
 */
export type BattleShipRowIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Column indices in BattleShip start at the left of the board and go right
 */
export type BattleShipColIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;


/**
 * Colors for BattleShip are based on the board color of the user
 */
export type BattleShipColor = 'Blue' | 'Green';


/**
 * Each possible individual section of a boat
 * Full boats should start with a 'Back' piece and end with a 'Front' piece
 */
export type BattleshipBoat = 
    "Aircraft_Back" 
  | "Aircraft_Middle_1"
  | "Aircraft_Middle_2"
  | "Aircraft_Front"
  | "Battleship_Back"
  | "Battleship_Middle_1"
  | "Battleship_Middle_2"
  | "Battleship_Middle_3"
  | "Battleship_Front"
  | "Cruiser_Back"
  | "Cruiser_Front"
  | "Destroyer"
  | "Submarine_Back"
  | "Submarine_Middle"
  | "Submarine_Front";

/**
 * Whether or not a cell has been guessed or not, 'Hit' if guessed and 'Safe' if not
 */
export type BattleShipCellState = "Hit" | "Safe";

/**
 * A BattleShipCell can either be "Ocean", representing 1 of 4 ocean tiles or a BattleShipCell, representing
 *  one of the many Battleship pieces. 
 * A BattleShipCell is either "Hit", meaning it has been chosen during a turn or "Safe", meaning it has not been.
 */
export type BattleShipCell = {
  // Whether the cell is an ocean or a boat cell, and which kind of boat
  type: BattleshipBoat | "Ocean";
  // If a cell has been guessed or not
  state: BattleShipCellState;
  // The row of the cell
  row: BattleShipRowIndex;
  // The col of the cell
  col: BattleShipColIndex;
}

export type InteractableID = string;
export type GameInstanceID = string;

/**
 * Type for the result of a game
 */
export interface GameResult {
  gameID: GameInstanceID;
  scores: { [playerName: string]: number };
}

/**
 * Base type for an *instance* of a game. An instance of a game
 * consists of the present state of the game (which can change over time),
 * the players in the game, and the result of the game
 * @see GameState
 */
export interface GameInstance<T extends GameState> {
  state: T;
  id: GameInstanceID;
  players: PlayerID[];
  result?: GameResult;
}

/**
 * Base type for an area that can host a game
 * @see GameInstance
 */
export interface GameArea<T extends GameState> extends Interactable {
  game: GameInstance<T> | undefined;
  history: GameResult[];
}

export type CommandID = string;

/**
 * Base type for a command that can be sent to an interactable.
 * This type is used only by the client/server interface, which decorates
 * an @see InteractableCommand with a commandID and interactableID
 */
interface InteractableCommandBase {
  /**
   * A unique ID for this command. This ID is used to match a command against a response
   */
  commandID: CommandID;
  /**
   * The ID of the interactable that this command is being sent to
   */
  interactableID: InteractableID;
  /**
   * The type of this command
   */
  type: string;
}

export type InteractableCommand =  ViewingAreaUpdateCommand | JoinGameCommand | GameMoveCommand<TicTacToeMove> | GameMoveCommand<ConnectFourMove> | GameMoveCommand<BattleShipGuess> | SetUpGameMove | StartGameCommand | LeaveGameCommand;
export interface ViewingAreaUpdateCommand  {
  type: 'ViewingAreaUpdate';
  update: ViewingArea;
}
export interface JoinGameCommand {
  type: 'JoinGame';
}
export interface LeaveGameCommand {
  type: 'LeaveGame';
  gameID: GameInstanceID;
}
export interface StartGameCommand {
  type: 'StartGame';
  gameID: GameInstanceID;
}
export interface GameMoveCommand<MoveType> {
  type: 'GameMove';
  gameID: GameInstanceID;
  move: MoveType;
}
export interface SetUpGameMove {
  type: 'SetUpGameMove';
  gameID: GameInstanceID;
  placement: BattleShipPlacement; // TODO can be generalized to any game in future
  // placementType: 'Placement' | 'Removal';
}
export type InteractableCommandReturnType<CommandType extends InteractableCommand> = 
  CommandType extends JoinGameCommand ? { gameID: string}:
  CommandType extends ViewingAreaUpdateCommand ? undefined :
  CommandType extends GameMoveCommand<TicTacToeMove> ? undefined :
  CommandType extends LeaveGameCommand ? undefined :
  never;

export type InteractableCommandResponse<MessageType> = {
  commandID: CommandID;
  interactableID: InteractableID;
  error?: string;
  payload?: InteractableCommandResponseMap[MessageType];
}

export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  commandResponse: (response: InteractableCommandResponse) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
  interactableCommand: (command: InteractableCommand & InteractableCommandBase) => void;
}

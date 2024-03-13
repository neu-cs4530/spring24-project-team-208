import React from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';

export type BattleShipGameProps = {
  gameAreaController: BattleShipAreaController;
};

/**
 * A component that renders the BattleShip board
 *
 * Renders the BattleShip board as a "StyledBattleShipBoard", which consists of "StyledBattleShipSquare"s
 * (one for each cell in the board, starting from the top left and going left to right, top to bottom).
 *
 * Each StyledBattleShipSquare has an aria-label property that describes the cell's position in the board,
 * formatted as `Cell ${rowIndex},${colIndex} (Miss|Hit|Boat|Empty)`.
 *
 * The background color of each StyledBattleShipSquare is determined by the value of the cell in the board, either
 * 'miss', 'hit', 'boat' or '' (an empty for an empty square).
 *
 * The board is re-rendered whenever the board changes, and each cell is re-rendered whenever the value of that cell changes.
 *
 * If the current player is in the game, then each StyledBattleShipSquare is clickable, and clicking
 * on it will make a move in that column. If there is an error making the move, then a toast will be
 * displayed with the error message as the description of the toast. If it is not the current player's
 * turn, then the StyledBattleShipSquare will be disabled.
 *
 * @param gameAreaController the controller for the BattleShip game
 */
export default function BattleShipBoard({ gameAreaController }: BattleShipGameProps): JSX.Element {
  return <>Implement this to show battleship board</>;
}

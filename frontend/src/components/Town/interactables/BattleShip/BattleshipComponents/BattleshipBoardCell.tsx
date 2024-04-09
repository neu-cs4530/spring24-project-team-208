import React from 'react';
import BattleShipAreaController, {
  BATTLESHIP_ROWS,
} from '../../../../../classes/interactable/BattleShipAreaController';
import { BattleShipCell } from '../../../../../types/CoveyTownSocket';
import { BATTLESHIP_PIECE_STORE, fireOverlay, OCEAN_STORE } from '../BattleshipCellSprites';
import { crosshair } from '../BattleshipMenuSprites';

const CELL_SIZE = 54;

export function BattleShipBoardCell({
  controller,
  cell,
  chooseCell,
  chosenCell,
}: {
  controller: BattleShipAreaController;
  cell: BattleShipCell;
  chooseCell: (cell: BattleShipCell) => void;
  chosenCell: BattleShipCell | undefined;
}) {
  const inPlacement = controller.status === 'PLACING_BOATS';
  const handleClick = () => {
    if (!inPlacement && (cell.type !== 'Ocean' || !controller.isOurTurn)) return;
    chooseCell(cell);
  };
  const hit = cell.state === 'Hit';
  const board =
    controller.whatColor === 'Blue'
      ? !inPlacement && controller.isOurTurn
        ? controller.greenBoard
        : controller.blueBoard
      : !inPlacement && controller.isOurTurn
      ? controller.blueBoard
      : controller.greenBoard;
  const shouldRotate =
    cell.type !== 'Ocean' &&
    ((cell.row + 1 < BATTLESHIP_ROWS && board[cell.row + 1][cell.col].type !== 'Ocean') ||
      (cell.row - 1 >= 0 && board[cell.row - 1][cell.col].type !== 'Ocean'));

  return (
    <div
      style={{
        height: CELL_SIZE,
        display: 'relative',
        width: CELL_SIZE,
        position: 'relative',
      }}
      onClick={handleClick}>
      <div
        style={{
          rotate: shouldRotate ? '90deg' : '0deg',
          position: 'relative',
        }}>
        {cell?.type === 'Ocean'
          ? OCEAN_STORE[Math.floor(Math.random() * OCEAN_STORE.length)]
          : BATTLESHIP_PIECE_STORE.find(piece => piece.name === cell?.type)?.component}
      </div>
      {hit && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}>
          {fireOverlay}
        </div>
      )}
      {(inPlacement || (!inPlacement && controller.isOurTurn)) && cell === chosenCell && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}>
          {crosshair}
        </div>
      )}
    </div>
  );
}

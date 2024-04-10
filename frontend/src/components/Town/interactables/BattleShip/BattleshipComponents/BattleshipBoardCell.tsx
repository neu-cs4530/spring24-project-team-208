import React from 'react';
import BattleShipAreaController, {
  BATTLESHIP_ROWS,
} from '../../../../../classes/interactable/BattleShipAreaController';
import { BattleshipBoat, BattleShipCell } from '../../../../../types/CoveyTownSocket';
import {
  MILITARY_PIECE_STORE,
  BARBIE_PIECE_STORE,
  fireOverlay,
  OCEAN_STORE,
} from '../BattleshipCellSprites';
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
  chooseCell: any;
  chosenCell: any;
}) {
  const pieceStore = controller.theme === 'Barbie' ? BARBIE_PIECE_STORE : MILITARY_PIECE_STORE;
  const inPlacement = controller.status === 'PLACING_BOATS';
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
    ((cell.row + 1 < BATTLESHIP_ROWS &&
      board[cell.row + 1][cell.col].type.split('_')[0] === cell.type.split('_')[0]) ||
      (cell.row - 1 >= 0 &&
        board[cell.row - 1][cell.col].type.split('_')[0] === cell.type.split('_')[0]));

  const destroyedBoats: BattleshipBoat[] = [];
  const hitBoats = new Map<string, number>();
  board.map((row: BattleShipCell[]) =>
    row.map((col: BattleShipCell) => {
      if (col.type !== 'Ocean' && col.state === 'Hit') {
        hitBoats.set(col.type.split('_')[0], (hitBoats.get(col.type.split('_')[0]) || 0) + 1);
      }
    }),
  );
  hitBoats.forEach((value, key) => {
    switch (key) {
      case 'Battleship': {
        if (value === 5) destroyedBoats.push('Battleship');
        break;
      }
      case 'Aircraft': {
        if (value === 4) destroyedBoats.push('Aircraft');
        break;
      }
      case 'Submarine': {
        if (value === 3) destroyedBoats.push('Submarine');
        break;
      }
      case 'Cruiser': {
        if (value === 2) destroyedBoats.push('Cruiser');
        break;
      }
      case 'Destroyer': {
        if (value === 1) destroyedBoats.push('Destroyer');
        break;
      }
      default: {
        break;
      }
    }
  });

  const handleClick = () => {
    if (!inPlacement && (cell.type !== 'Ocean' || !controller.isOurTurn)) return;
    chooseCell(cell);
  };

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
        {cell?.type === 'Ocean' ||
        (controller.isOurTurn &&
          cell.type !== 'Ocean' &&
          hit &&
          !destroyedBoats.includes(cell.type.split('_')[0]))
          ? OCEAN_STORE[Math.floor(Math.random() * OCEAN_STORE.length)]
          : pieceStore.find(piece => piece.name === cell?.type)?.component}
      </div>
      {hit && cell.type !== 'Ocean' && (
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
      {hit && cell.type === 'Ocean' && (
        <div
          style={{
            position: 'absolute',
            top: 17,
            left: 10,
            fontSize: '10rem',
            color: '#524747',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'arrow',
          }}>
          .
        </div>
      )}
      {(inPlacement || (!inPlacement && controller.isOurTurn && !hit)) && cell === chosenCell && (
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

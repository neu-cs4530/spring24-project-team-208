import React, { useState } from 'react';
import { BattleShipCell } from '../../../../../types/CoveyTownSocket';
import { BATTLESHIP_PIECE_STORE, fireOverlay, OCEAN_STORE } from '../BattleshipCellSprites';
import { crosshair } from '../BattleshipMenuSprites';

const CELL_SIZE = 54;

export function BattleShipBoardCell({
  cell,
  chooseCell,
  chosenCell,
}: {
  cell: BattleShipCell;
  chooseCell: any;
  chosenCell: any;
}) {
  const handleClick = () => {
    chooseCell(cell);
  };
  const hit = cell?.state === 'Hit';
  return (
    <div
      style={{
        height: CELL_SIZE,
        display: 'relative',
        width: CELL_SIZE,
      }}
      onClick={handleClick}>
      {cell?.type === 'Ocean'
        ? OCEAN_STORE[Math.floor(Math.random() * OCEAN_STORE.length)]
        : BATTLESHIP_PIECE_STORE.find(piece => piece.name === cell?.type)?.component}
      {hit && fireOverlay}
      {(cell === chosenCell) && crosshair}
    </div>
  );
}

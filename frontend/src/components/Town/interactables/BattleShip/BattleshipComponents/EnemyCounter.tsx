import React from 'react';
import BattleShipAreaController from '../../../../../classes/interactable/BattleShipAreaController';
import {
  BattleshipBoat,
  BattleShipBoatPiece,
  BattleShipCell,
} from '../../../../../types/CoveyTownSocket';
import { scratch } from '../BattleshipMenuSprites';

// @import url('https://fonts.googleapis.com/css2?family=Just+Me+Again+Down+Here&display=swap');

// .just-me-again-down-here {
//   font-family: 'Just Me Again Down Here', cursive;
//   font-weight: 400;
//   font-style: normal;
// }

const SHIPS: BattleshipBoat[] = [
  'Battleship',
  'Aircraft Carrier',
  'Submarine',
  'Cruiser',
  'Destroyer',
];

export function EnemyCounter({
  controller,
  setBoat,
  chosenBoat,
}: {
  controller: BattleShipAreaController;
  setBoat: any;
  chosenBoat?: BattleShipBoatPiece;
}) {
  const inPlacement = controller.status === 'PLACING_BOATS';
  const scratchedBoats: BattleshipBoat[] = [];

  if (inPlacement) {
    const board = controller.whatColor === 'Blue' ? controller.blueBoard : controller.greenBoard;
    board.map((inner: BattleShipCell[]) =>
      inner.map((cell: BattleShipCell) => {
        switch (cell.type.split('_')[0]) {
          case 'Aircraft': {
            scratchedBoats.push('Aircraft Carrier');
            break;
          }
          case 'Battleship': {
            scratchedBoats.push('Battleship');
            break;
          }
          case 'Submarine': {
            scratchedBoats.push('Submarine');
            break;
          }
          case 'Cruiser': {
            scratchedBoats.push('Cruiser');
            break;
          }
          case 'Destroyer': {
            scratchedBoats.push('Destroyer');
            break;
          }
          default: {
            break;
          }
        }
      }),
    );
  } else {
    const board = controller.whatColor === 'Blue' ? controller.greenBoard : controller.blueBoard;
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
          if (value === 5) scratchedBoats.push('Battleship');
          break;
        }
        case 'Aircraft': {
          if (value === 4) scratchedBoats.push('Aircraft Carrier');
          break;
        }
        case 'Submarine': {
          if (value === 3) scratchedBoats.push('Submarine');
          break;
        }
        case 'Cruiser': {
          if (value === 2) scratchedBoats.push('Cruiser');
          break;
        }
        case 'Destroyer': {
          if (value === 1) scratchedBoats.push('Destroyer');
          break;
        }
        default: {
          break;
        }
      }
    });
  }

  const handleClick = (boat: BattleshipBoat) => {
    if (!inPlacement || scratchedBoats.includes(boat)) {
      return;
    }
    setBoat(boat);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ textDecoration: 'underline', fontFamily: 'Scribble', fontSize: '1.4rem' }}>
        {inPlacement ? 'Ship Placements Remaining:' : 'Enemy Ships Remaining:'}
      </h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Scribble',
          fontSize: '1.2rem',
        }}>
        {SHIPS.map((name: BattleshipBoat, index) => (
          <span
            style={{ cursor: 'pointer', position: 'relative' }}
            key={index}
            onClick={() => handleClick(name)}>
            {scratchedBoats.includes(name) && <span>{scratch}</span>}
            <span>
              {inPlacement &&
              chosenBoat?.replace(/_/g, ' ') === name &&
              !scratchedBoats.includes(name)
                ? `${name} ★`
                : name}
            </span>
            <br />
          </span>
        ))}
      </div>
    </div>
  );
}

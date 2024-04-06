import React from 'react';
import BattleShipAreaController from '../../../../../classes/interactable/BattleShipAreaController';
import { BattleshipBoat, BattleshipBoatPiece, BattleShipCell } from '../../../../../types/CoveyTownSocket';
import { scratch } from '../BattleshipMenuSprites';

// @import url('https://fonts.googleapis.com/css2?family=Just+Me+Again+Down+Here&display=swap');

// .just-me-again-down-here {
//   font-family: 'Just Me Again Down Here', cursive;
//   font-weight: 400;
//   font-style: normal;
// }

const SHIPS: BattleshipBoat[] = ['Battleship', 'Aircraft Carrier', 'Submarine', 'Cruiser', 'Destroyer'];

export function EnemyCounter({
  controller,
  setBoat,
  chosenBoat,
}: {
  controller: BattleShipAreaController;
  setBoat: any;
  chosenBoat?: BattleshipBoatPiece;
}) {
  const inPlacement = controller.status === 'PLACING_BOATS';

  const scratchedBoats: BattleshipBoat[] = []
  if (inPlacement) {
    const board = controller.whatColor === 'Blue'
      ? controller.blueBoard
      : controller.greenBoard;
    board.map((inner: BattleShipCell[]) => 
      inner.map((cell: BattleShipCell) => {
        switch (cell.type.split('_')[0]) {
          case "Aircraft": {
            scratchedBoats.push('Aircraft Carrier')
            break;
          }
          case "Battleship": {
            scratchedBoats.push('Battleship')
            break;
          }
          case "Submarine": {
            scratchedBoats.push('Submarine')
            break;
          }
          case "Cruiser": {
            scratchedBoats.push('Cruiser')
            break;
          }
          case "Destroyer": {
            scratchedBoats.push('Destroyer')
            break;
          }
          default: {
            console.log('bruh')
          }
        }
      })
    );
  }

  const handleClick = (boat: BattleshipBoat) => {
    if (!inPlacement || scratchedBoats.includes(boat)) { return };
    setBoat(boat);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 className='just-me-again-down-here' style={{ textDecoration: 'underline' }}>
        {inPlacement ? 'Ship Placements Remaining:' : 'Enemy Ships Remaining:'}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {SHIPS.map((name: BattleshipBoat, index) => (
          <span
            style={{ cursor: 'pointer', position: 'relative' }}
            key={index}
            onClick={() => handleClick(name)}>
            {/* {chosenBoat?.replace(/_/g, ' ') === name && <span>{scratch}</span>} */}
            {scratchedBoats.includes(name) && <span>{scratch}</span>}
            <span>{(chosenBoat?.replace(/_/g, ' ') === name && !scratchedBoats.includes(name)) ? `${name} ★` : name}</span>
            <br />
          </span>
        ))}
      </div>
    </div>
  );
}

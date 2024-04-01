import BattleShipAreaController from "../../../../../classes/interactable/BattleShipAreaController";
import { BattleshipBoat } from "../../../../../types/CoveyTownSocket";
import { Scratch } from "../BattleshipMenuSprites";

// @import url('https://fonts.googleapis.com/css2?family=Just+Me+Again+Down+Here&display=swap');

// .just-me-again-down-here {
//   font-family: 'Just Me Again Down Here', cursive;
//   font-weight: 400;
//   font-style: normal;
// }

const ships = ["Battleship", "Aircraft Carrier", "Submarine", "Cruiser", "Destroyer"]

export function EnemyCounter(
  {
    controller,
    setBoat,
    chosenBoat,
  }: {
    controller: BattleShipAreaController,
    setBoat: Function,
    chosenBoat?: BattleshipBoat,
  }) {
    const inPlacement = controller.status === 'PLACING_BOATS';

    const handleClick = (boat: string) => {
      if (!inPlacement) {
        return
      }
      setBoat(boat);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 className="just-me-again-down-here" style={{ textDecoration: 'underline' }}>{inPlacement ? 'Ship Placements Remaining:' : 'Enemy Ships Remaining:'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ships.map((name: string, index) => (
            <span
              style={{ cursor: 'pointer', position: 'relative' }}
              key={index}
              onClick={() => handleClick(name)}
            >
              {chosenBoat?.replace(/_/g, ' ') === name && <span>{Scratch}</span>}
              <span>{name}</span>
              <br />
            </span>
          ))}
        </div>
      </div>
    )
  }
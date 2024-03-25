import BattleShipAreaController from "../../../../../classes/interactable/BattleShipAreaController";
import { Scratch } from "../BattleshipMenuSprites/BattleshipMenuSprites";

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
  }: {
    controller: BattleShipAreaController,
    setBoat: Function,
  }) {
    const inPlacement = controller.status === 'PLACING_BOATS';

    const handleClick = (boat: string) => {
      if (!inPlacement) {
        return
      }
      setBoat(boat);
    }

    return (
      <div>
        <h3 className="just-me-again-down-here" style={{ textDecoration: 'underline' }}>{inPlacement ? 'Ship Placements Remaining:' : 'Enemy Ships Remaining:'}</h3>
        {ships.map((name: string, index) => {
          return (
            <span 
              key={index}
              onClick={() => handleClick(name)}
            >
              {/* {Scratch} */}
              {name}
            </span>
          )
        })}
      </div>
    )
  }
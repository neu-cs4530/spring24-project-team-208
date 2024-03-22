import BattleShipAreaController from "../../../../../classes/interactable/BattleShipAreaController";
import { Scratch } from "../BattleshipMenuSprites/BattleshipMenuSprites";
import './EnemyCounter.css';

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
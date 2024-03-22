import BattleShipAreaController from "../../../../../classes/interactable/BattleShipAreaController";
import { BattleshipBoat, BattleShipCell } from "../../../../../types/CoveyTownSocket";
import './ActionButton.css';

export default function ActionButton(
    {
        controller, 
        chosenCell,
        chosenBoat,
        doAction,
    } : {
        controller: BattleShipAreaController, 
        chosenCell: BattleShipCell | undefined,
        chosenBoat: BattleshipBoat | undefined,
        doAction: Function,
    }) {
    const inPlacement = controller.status === 'PLACING_BOATS';
    const handleClick = () => {
        if (chosenCell) {
            if (inPlacement && !chosenBoat) {
                return
            }
            doAction()
        }
    }
    return (
        <div 
            className="action-button"
            onClick={handleClick}
        >
            {inPlacement ? 'PLACE' : 'FIRE'}
        </div>
    )
}
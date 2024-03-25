import BattleShipAreaController from "../../../../../classes/interactable/BattleShipAreaController";
import { BattleshipBoat, BattleShipCell } from "../../../../../types/CoveyTownSocket";

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
            style={{
                backgroundColor: "#C60000",
                borderRadius: '50%',
                border: '10px solid #A6A6A6',
            }}
            onClick={handleClick}
        >
            {inPlacement ? 'PLACE' : 'FIRE'}
        </div>
    )
}
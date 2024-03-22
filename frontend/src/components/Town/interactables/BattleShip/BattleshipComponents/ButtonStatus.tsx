import BattleShipAreaController, { BattleShipCell } from "../../../../../classes/interactable/BattleShipAreaController";
import useTownController from "../../../../../hooks/useTownController";
import { Awaiting_Button, Ready_Button } from "../BattleshipMenuSprites/BattleshipMenuSprites";
import './ButtonStatus.css';
export default function ButtonStatus(
    {
        controller, 
        chosenCell
    } : {
        controller: BattleShipAreaController, 
        chosenCell: BattleShipCell
    }) {
        const townController = useTownController();
        let turnText: string;

        const inPlacementPhase = controller.status === 'PLACING_BOATS';
        if (inPlacementPhase) {
            turnText = validChosenCellPlacement(chosenCell) ? 'READY TO PLACE' : 'CHOOSE SHIP'
        } else {
            turnText = validChosenCellFire(chosenCell) ? 'READY TO FIRE' : 'CANNOT FIRE'
        }
        
        return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div className="button-status-container">
                    <p className="status-text">{turnText}</p>

                </div>
                {turnText.includes('READY') ? Ready_Button : Awaiting_Button}
            </div>
        )
}

function validChosenCellPlacement(cell: BattleShipCell) {
    return cell?.type === "Ocean"
}

function validChosenCellFire(cell: BattleShipCell) {
    return cell?.type === "Ocean" && cell.state === 'Safe';
}
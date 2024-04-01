import BattleShipAreaController from "../../../../../classes/interactable/BattleShipAreaController";
import useTownController from "../../../../../hooks/useTownController";
import { BattleShipCell } from "../../../../../types/CoveyTownSocket";
import { Awaiting_Button, Ready_Button } from "../BattleshipMenuSprites";
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
            <div style={{ display: 'absolute' }}>
                <div 
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '150px',
                        height: '25px',
                        backgroundColor: '#1C1C1C',
                        borderRadius: '10px'
                    }}
                >
                    <p style={{ marginLeft: 10, color: '#24FF00', fontSize: '.7rem' }}>{turnText}</p>
                </div>
                <span
                    style={{
                        display: 'relative',
                        top: '90%'
                    }}
                >
                    {turnText.includes('READY') ? Ready_Button : Awaiting_Button}
                </span>
            </div>
        )
}

function validChosenCellPlacement(cell: BattleShipCell) {
    return cell?.type === "Ocean"
}

function validChosenCellFire(cell: BattleShipCell) {
    return cell?.type === "Ocean" && cell.state === 'Safe';
}
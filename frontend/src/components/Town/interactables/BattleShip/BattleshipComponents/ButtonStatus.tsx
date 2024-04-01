import BattleShipAreaController from "../../../../../classes/interactable/BattleShipAreaController";
import useTownController from "../../../../../hooks/useTownController";
import { BattleShipCell, BattleshipBoat } from "../../../../../types/CoveyTownSocket";
import { Awaiting_Button, Ready_Button } from "../BattleshipMenuSprites";
export default function ButtonStatus(
    {
        controller, 
        chosenCell,
        chosenBoat
    } : {
        controller: BattleShipAreaController, 
        chosenCell?: BattleShipCell,
        chosenBoat?: BattleshipBoat,
    }) {
        const townController = useTownController();
        const inPlacementPhase = controller.status === 'PLACING_BOATS';
        let turnText = inPlacementPhase ? 'CHOOSE SHIP' : 'CANNOT FIRE';

        if (chosenCell && validChosenCellPlacement(chosenCell)) {
            if (inPlacementPhase) {
                turnText = chosenBoat ? 'READY TO PLACE' : 'PLACE BOAT';
            } else if (!inPlacementPhase) {
                turnText = 'READY TO FIRE';
            }
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
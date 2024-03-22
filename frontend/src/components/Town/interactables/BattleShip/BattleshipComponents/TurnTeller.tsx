import BattleShipAreaController from "../../../../../classes/interactable/BattleShipAreaController";
import useTownController from "../../../../../hooks/useTownController";
import './TurnTeller.css';

export default function TurnTeller({controller} : {controller: BattleShipAreaController}) {
    const townController = useTownController();
    const turnText = controller.status === 'PLACING_BOATS' 
        ? 'PLACE SHIP' 
        : controller.whoseTurn === townController.ourPlayer 
            ? 'YOUR TURN' 
            : 'OPPONENT\`s TURN';
    return (
        <div className="turn-teller-container">
            <p className="turn-text">{turnText}</p>
        </div>
    )
}
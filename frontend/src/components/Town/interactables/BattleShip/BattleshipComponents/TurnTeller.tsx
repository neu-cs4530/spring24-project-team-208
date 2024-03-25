import BattleShipAreaController from "../../../../../classes/interactable/BattleShipAreaController";
import useTownController from "../../../../../hooks/useTownController";

// @font-face {
//     font-family: 'Digital Numbers Regular';
//     font-style: normal;
//     font-weight: normal;
//     src: local('Digital Numbers Regular'), url('DigitalNumbers-Regular.woff') format('woff');
// }


export default function TurnTeller({controller} : {controller: BattleShipAreaController}) {
    const townController = useTownController();
    const turnText = controller.status === 'PLACING_BOATS' 
        ? 'PLACE SHIP' 
        : controller.whoseTurn === townController.ourPlayer 
            ? 'YOUR TURN' 
            : 'OPPONENT\`s TURN';
    return (
        <div 
            style={{
                width: '300px',
                height: '50px',
                backgroundColor: '#1C1C1C',
                borderRadius: '10px',
            }}
        >
            <p style={{ color: '#24FF00' }}>{turnText}</p>
        </div>
    )
}
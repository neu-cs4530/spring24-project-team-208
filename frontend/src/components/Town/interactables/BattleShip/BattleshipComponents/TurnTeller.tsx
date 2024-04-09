import React from 'react';
import BattleShipAreaController from '../../../../../classes/interactable/BattleShipAreaController';
import useTownController from '../../../../../hooks/useTownController';

export default function TurnTeller({ controller }: { controller: BattleShipAreaController }) {
  const townController = useTownController();
  const turnText =
    controller.status === 'PLACING_BOATS'
      ? 'SHIP PLACEMENT PHASE'
      : controller.whoseTurn === townController.ourPlayer
      ? 'YOUR TURN'
      : "OPPONENT'S TURN";
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '290px',
        height: '40px',
        backgroundColor: '#1C1C1C',
        borderRadius: '10px',
      }}>
      <p style={{ marginLeft: 10, color: '#24FF00' }}>{turnText}</p>
    </div>
  );
}

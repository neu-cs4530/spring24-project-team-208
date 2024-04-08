import React from 'react';
import BattleShipAreaController from '../../../../../classes/interactable/BattleShipAreaController';
import { verticalSwitch, verticalSwitchLever } from '../BattleshipMenuSprites';

export default function VerticalSwitchButton({
  controller,
  isVertical,
  setIsVertical,
}: {
  controller: BattleShipAreaController;
  isVertical: boolean;
  setIsVertical: any;
}) {
  const handleVerticalSwitchClick = () => {
    setIsVertical(!isVertical);
  };

  return (
    <div
      style={{
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={handleVerticalSwitchClick}>
      <span
        style={{
          position: 'absolute',
        }}>
        {verticalSwitch}
      </span>
      <span
        style={{
          position: 'absolute',
          rotate: isVertical ? '0deg' : '90deg',
        }}>
        {verticalSwitchLever}
      </span>
    </div>
  );
}

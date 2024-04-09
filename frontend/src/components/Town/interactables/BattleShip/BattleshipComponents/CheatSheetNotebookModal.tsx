import React from 'react';
import BattleShipAreaController from '../../../../../classes/interactable/BattleShipAreaController';
import { largeNotebook, notebookExit } from '../BattleshipMenuSprites';

export function CheatSheetNoteBookModal({ controller }: { controller: BattleShipAreaController }) {
  return (
    <>
      <div>
        <span>{notebookExit}</span>
        {largeNotebook}
      </div>
    </>
  );
}

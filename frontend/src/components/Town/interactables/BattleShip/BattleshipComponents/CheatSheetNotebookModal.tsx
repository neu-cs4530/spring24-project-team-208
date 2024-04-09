import React from 'react';
import BattleShipAreaController from '../../../../../classes/interactable/BattleShipAreaController';
import { largeNotebook, notebookExit } from '../BattleshipMenuSprites';

// .hover-shadow {
//     transition: box-shadow 0.3s;
//     }

//   .hover-shadow:hover {
//     box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
//   }

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

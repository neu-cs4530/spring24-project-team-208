import React from 'react';
import { smallNotebook } from '../BattleshipMenuSprites';

export function CheatSheetNoteBookSmall({ openModal }: { openModal: () => void }) {
  return (
    <span className='green_shadow' onClick={() => openModal}>
      {smallNotebook}
    </span>
  );
}

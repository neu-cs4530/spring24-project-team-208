import React from 'react';
import { smallNotebook } from '../BattleshipMenuSprites';

// .green-shadow {
//     transition: box-shadow 0.3s;
//   }

// .green-shadow:hover {
//     box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
// }

export function CheatSheetNoteBookSmall({ openModal }: { openModal: any }) {
  const handleClick = () => {
    openModal();
  };
  return (
    <span
      className='green_shadow'
      onClick={handleClick}
      style={{
        cursor: 'pointer',
      }}>
      {smallNotebook}
    </span>
  );
}

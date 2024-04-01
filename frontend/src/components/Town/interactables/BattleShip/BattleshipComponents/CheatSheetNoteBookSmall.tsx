import { Small_Notebook } from "../BattleshipMenuSprites";

// .green-shadow {
//     transition: box-shadow 0.3s; 
//   }
  
// .green-shadow:hover {
//     box-shadow: 0 0 10px rgba(0, 255, 0, 0.5); 
// }

export function CheatSheetNoteBookSmall({openModal} : {openModal: any}) {
    return (
        <span 
            className='green_shadow'
            onClick={() => openModal}
        >
            {Small_Notebook}
        </span>
    )
}
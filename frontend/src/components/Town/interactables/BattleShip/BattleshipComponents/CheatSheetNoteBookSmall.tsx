import { Small_Notebook } from "../BattleshipMenuSprites/BattleshipMenuSprites";
import './CheatSheetNoteBookSmall.css';

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
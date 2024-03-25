import { useDisclosure } from "@chakra-ui/react";
import BattleShipAreaController from "../../../../../classes/interactable/BattleShipAreaController";
import { Large_Notebook, Notebook_Exit } from "../BattleshipMenuSprites/BattleshipMenuSprites";

// .hover-shadow {
//     transition: box-shadow 0.3s; 
//     }
    
//   .hover-shadow:hover {
//     box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); 
//   }

export function CheatSheetNoteBookModal({controller}: {controller: BattleShipAreaController}) {

    return (
        <>
            <div>
                <span>
                    {Notebook_Exit}
                </span>
                {Large_Notebook}
            </div>
        </>
    )
}

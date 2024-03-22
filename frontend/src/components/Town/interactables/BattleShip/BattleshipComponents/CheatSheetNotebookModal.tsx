import { useDisclosure } from "@chakra-ui/react";
import BattleShipAreaController from "../../../../../classes/interactable/BattleShipAreaController";
import { Large_Notebook, Notebook_Exit } from "../BattleshipMenuSprites/BattleshipMenuSprites";
import './CheatSheetNoteBookModal.css';

export function CheatSheetNoteBookModal({controller, exitModal}: {controller: BattleShipAreaController, exitModal: Function}) {

    return (
        <>
            <span
                onClick={() => exitModal}
                className='hover-shadow'
            >
                {Notebook_Exit}
            </span>
            {Large_Notebook}
        </>
    )
}

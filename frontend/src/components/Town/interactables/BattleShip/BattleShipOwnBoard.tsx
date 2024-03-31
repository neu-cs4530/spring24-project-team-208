import { Modal, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import useTownController from '../../../../hooks/useTownController';
import { BattleshipBoat, BattleShipCell, Cell_SIZE } from '../../../../types/CoveyTownSocket';
import { Battleship_Logo, Crosshair, Scratch, Small_Notebook } from './BattleshipMenuSprites/BattleshipMenuSprites';
import { BattleShipBoardCell } from './BattleshipComponents/BattleshipBoardCell';
import { EnemyCounter } from './BattleshipComponents/EnemyCounter';
import { CheatSheetNoteBookSmall } from './BattleshipComponents/CheatSheetNoteBookSmall';
import { CheatSheetNoteBookModal } from './BattleshipComponents/CheatSheetNotebookModal';
import TurnTeller from './BattleshipComponents/TurnTeller';
import ButtonStatus from './BattleshipComponents/ButtonStatus';
import ActionButton from './BattleshipComponents/ActionButton';

export type BattleShipGameProps = {
  gameAreaController: BattleShipAreaController;
};

/**
 * A component that renders the BattleShip board
 *
 * Renders the BattleShip board as a "StyledBattleShipBoard", which consists of "StyledBattleShipSquare"s
 * (one for each cell in the board, starting from the top left and going left to right, top to bottom).
 *
 * Each StyledBattleShipSquare has an aria-label property that describes the cell's position in the board.
 * Depending on who the player is, the cell will either be be formatted as `Cell ${rowIndex},${colIndex} (Miss|Hit|Empty)`
 * if the current player is green or an observer or as `Cell ${rowIndex},${colIndex} (Front|Middle|End|Empty) if the
 * current player is blue.
 *
 * Players not in the game will see `Cell ${rowIndex},${colIndex} (Miss|Hit|Empty)` for both boards.
 *
 * The background color of each StyledBattleShipSquare is determined by the value of the cell in the board, either
 * 'miss', 'hit', or '' (an empty for an empty square) if the current player is green or an observer or 'front', 'middle',
 * 'end', or '' (an empty for an empty square) if the current player is blue.
 *
 * The board is re-rendered whenever the board changes, and each cell is re-rendered whenever the value of that cell changes.
 *
 * If the current player is in the game, then each StyledBattleShipSquare is clickable, and clicking
 * on it will make a move in that column. If there is an error making the move, then a toast will be
 * displayed with the error message as the description of the toast. If it is not the current player's
 * turn, then the StyledBattleShipSquare will be disabled.
 *
 * @param gameAreaController the controller for the BattleShip game
 */   //CHANGE
export default function BattleShipOwnBoard({
  gameAreaController,
}: BattleShipGameProps): JSX.Element {
  const townController = useTownController();
  const [board, setBoard] = useState<BattleShipCell[][]>(townController.ourPlayer === gameAreaController.blue ? gameAreaController.blueBoard : gameAreaController.greenBoard);
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);
  const [chosenCell, chooseChosenCell] = useState<BattleShipCell>();
  const [chosenBoat, setChosenBoat] = useState<BattleshipBoat>();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const openNotebook = () => { onOpen(); }
  const closeNotebook = () => { onClose(); }
  const inPlacement = gameAreaController.status === 'PLACING_BOATS';
  const placeBoat = () => {
    gameAreaController.placeBoatPiece(chosenBoat!, chosenCell!.row, chosenCell!.col)
  }
  const fireBoat = () => {
    gameAreaController.makeMove(chosenCell!.row, chosenCell!.col)
  }
  const toast = useToast();

  useEffect(() => {
    gameAreaController.addListener('turnChanged', setIsOurTurn);
    gameAreaController.addListener('boardChanged', setBoard);
    return () => {
      gameAreaController.removeListener('boardChanged', setBoard);
      gameAreaController.removeListener('turnChanged', setIsOurTurn);
    };
  }, [gameAreaController]);
  console.log(board)
  return (
    <div 
      style={{
        width: '1000px',
        height: '600px',
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        backgroundColor: '#6F6F78',   
        border: '3px solid black',
        borderRadius: '15px',
        padding: '10px',
      }}
    
    >
      {/* {isOpen && <CheatSheetNoteBookModal controller={gameAreaController} exitModal={closeNotebook} />} */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          width: '546px',
          height: '546px',
          border: '3px solid black',
          borderRadius: '15px',
        }}
      >
        {board.map((row: BattleShipCell[], rowIndex: number) => {
          return(row.map((cell: BattleShipCell, cellIndex: number) => {
            return(
              <BattleShipBoardCell 
                cell={cell} 
                key={cellIndex} 
                chooseCell={chooseChosenCell} 
                chosenCell={chosenCell}
              />)
          }))
        })}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {Battleship_Logo}
        <TurnTeller controller={gameAreaController} />
        <EnemyCounter 
          controller={gameAreaController} 
          setBoat={setChosenBoat}
        />
        <ActionButton 
          controller={gameAreaController} 
          chosenCell={chosenCell} 
          chosenBoat={chosenBoat} 
          doAction={inPlacement ? placeBoat : fireBoat}
        />
        <ButtonStatus controller={gameAreaController} chosenCell={chosenCell!}/>
        <CheatSheetNoteBookSmall openModal={openNotebook}/>
      </div>
    </div>
  );
}

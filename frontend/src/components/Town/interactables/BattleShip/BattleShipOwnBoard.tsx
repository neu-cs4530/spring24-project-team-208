import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import useTownController from '../../../../hooks/useTownController';
import {
  BattleShipBoatPiece,
  BattleShipCell,
  BattleShipDatabaseEntry,
} from '../../../../types/CoveyTownSocket';
import { battleshipLogo } from './BattleshipMenuSprites';
import { BattleShipBoardCell } from './BattleshipComponents/BattleshipBoardCell';
import { EnemyCounter } from './BattleshipComponents/EnemyCounter';
import { CheatSheetNoteBookSmall } from './BattleshipComponents/CheatSheetNoteBookSmall';
import { CheatSheetNoteBookModal } from './BattleshipComponents/CheatSheetNotebookModal';
import TurnTeller from './BattleshipComponents/TurnTeller';
import ButtonStatus from './BattleshipComponents/ButtonStatus';
import ActionButton from './BattleshipComponents/ActionButton';
import VerticalSwitchButton from './BattleshipComponents/VerticalSwitch';
import getBattleShipData from '../../../Database';
import assert from 'assert';

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
 */
export default function BattleShipOwnBoard({
  gameAreaController,
}: BattleShipGameProps): JSX.Element {
  const townController = useTownController();
  const [ownBoard, setOwnBoard] = useState<BattleShipCell[][]>(
    townController.ourPlayer === gameAreaController.blue
      ? gameAreaController.blueBoard
      : gameAreaController.greenBoard,
  );
  const [oppBoard, setOppBoard] = useState<BattleShipCell[][]>(
    townController.ourPlayer === gameAreaController.blue
      ? gameAreaController.greenBoard
      : gameAreaController.blueBoard,
  );
  const [isOurTurn, setIsOurTurn] = useState<boolean>(gameAreaController.isOurTurn);
  const [chosenCell, setChosenCell] = useState<BattleShipCell>();
  const [chosenBoat, setChosenBoat] = useState<BattleShipBoatPiece>();
  const [isVertical, setIsVertical] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inPlacement = gameAreaController.status === 'PLACING_BOATS';
  const [green, setGreen] = useState<BattleShipDatabaseEntry | null>(null);
  const [blue, setBlue] = useState<BattleShipDatabaseEntry | null>(null);

  const placeBoat = () => {
    assert(chosenBoat !== undefined);
    assert(chosenCell !== undefined);
    gameAreaController.placeBoatPiece(chosenBoat, chosenCell.row, chosenCell.col, isVertical);
    setChosenCell(undefined);
    setChosenBoat(undefined);
  };
  const fireBoat = () => {
    assert(chosenCell !== undefined);
    gameAreaController.makeMove(chosenCell.row, chosenCell.col);
    setChosenCell(undefined);
  };

  useEffect(() => {
    const setIsOurTurnMini = () => {
      setIsOurTurn(gameAreaController.whoseTurn === townController.ourPlayer);
    };
    const setOwnBoardMini = (board: BattleShipCell[][]) => {
      setOwnBoard(board);
      setIsOurTurnMini(); // bandaid
    };
    const setOpponentBoardMini = () => {
      const oppBoardMini =
        townController.ourPlayer === gameAreaController.blue
          ? gameAreaController.greenBoard
          : gameAreaController.blueBoard;

      let oldOpponentBoard: BattleShipCell[][] = oppBoardMini.map(inner => [...inner]);
      oldOpponentBoard = oldOpponentBoard.map(inner =>
        inner.map((cell: BattleShipCell) => {
          if (cell.state === 'Safe' && cell.type !== 'Ocean') {
            return {
              type: 'Ocean',
              state: 'Safe',
              row: cell.row,
              col: cell.col,
            };
          } else {
            return cell;
          }
        }),
      );
      setOppBoard(oldOpponentBoard);
      setIsOurTurnMini(); // bandaid
    };
    gameAreaController.addListener('turnChanged', setIsOurTurnMini);
    gameAreaController.addListener(
      'blueBoardChanged',
      townController.ourPlayer === gameAreaController.blue ? setOwnBoardMini : setOpponentBoardMini,
    );
    gameAreaController.addListener(
      'greenBoardChanged',
      townController.ourPlayer === gameAreaController.blue ? setOpponentBoardMini : setOwnBoardMini,
    );
    return () => {
      gameAreaController.removeListener(
        'blueBoardChanged',
        townController.ourPlayer === gameAreaController.blue
          ? setOwnBoardMini
          : setOpponentBoardMini,
      );
      gameAreaController.removeListener(
        'greenBoardChanged',
        townController.ourPlayer === gameAreaController.blue
          ? setOpponentBoardMini
          : setOwnBoardMini,
      );
      gameAreaController.removeListener('turnChanged', setIsOurTurnMini);
    };
  }, [gameAreaController, townController.ourPlayer]);
  useEffect(() => {
    const getData = async () => {
      const blueData = await getBattleShipData(gameAreaController.blue?.userName || '');
      setBlue(blueData);
      const greenData = await getBattleShipData(gameAreaController.green?.userName || '');
      setGreen(greenData);
    };
    getData();
  }, [gameAreaController.blue, gameAreaController.green]);

  return (
    <div
      style={{
        width: '950px',
        height: '600px',
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        backgroundColor: '#6F6F78',
        border: '3px solid black',
        borderRadius: '15px',
        padding: '10px',
        position: 'absolute',
        left: '-20%',
      }}>
      <Modal isOpen={isOpen} onClose={onClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <CheatSheetNoteBookModal controller={gameAreaController} />
        </ModalContent>
      </Modal>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          width: '546px',
          height: '546px',
          border: '3px solid black',
          borderRadius: '15px',
          overflow: 'hidden',
        }}>
        {(inPlacement ? ownBoard : isOurTurn ? oppBoard : ownBoard).map((row: BattleShipCell[]) => {
          return row.map((cell: BattleShipCell, cellIndex: number) => {
            return (
              <BattleShipBoardCell
                controller={gameAreaController}
                cell={cell}
                key={cellIndex}
                chooseCell={setChosenCell}
                chosenCell={chosenCell}
              />
            );
          });
        })}
      </div>
      <div
        style={{
          display: 'relative',
          flexDirection: 'column',
        }}>
        <span
          style={{
            position: 'relative',
            top: '10px',
            left: '10%',
          }}>
          {battleshipLogo}
        </span>
        <span
          style={{
            position: 'relative',
            top: '25px',
            left: '14%',
          }}>
          <TurnTeller controller={gameAreaController} />
        </span>
        <span
          style={{
            position: 'relative',
            top: '40%',
            left: '30%',
          }}>
          <VerticalSwitchButton
            controller={gameAreaController}
            isVertical={isVertical}
            setIsVertical={setIsVertical}
          />
        </span>
        <span
          style={{
            position: 'relative',
            top: '10%',
            right: '10%',
          }}>
          <EnemyCounter
            controller={gameAreaController}
            setBoat={setChosenBoat}
            chosenBoat={chosenBoat}
          />
        </span>
        <span
          style={{
            position: 'relative',
            bottom: '15%',
            left: '85%',
          }}>
          <ActionButton
            controller={gameAreaController}
            chosenCell={chosenCell}
            chosenBoat={chosenBoat}
            doAction={inPlacement ? placeBoat : fireBoat}
          />
        </span>
        <span
          style={{
            position: 'relative',
            bottom: '13%',
            left: '70%',
          }}>
          <ButtonStatus
            controller={gameAreaController}
            chosenCell={chosenCell}
            chosenBoat={chosenBoat}
          />
        </span>
        <span
          style={{
            position: 'relative',
            bottom: '13%',
            left: '70%',
          }}>
          <CheatSheetNoteBookSmall openModal={onOpen} />
        </span>
      </div>
      <span
        style={{
          position: 'relative',
          fontFamily: 'Scribble',
          bottom: '22.5%',
          left: '1%',
          fontSize: '1.5rem',
        }}>
        {`${gameAreaController.green?.userName} (${green ? Math.round(green.elo) : 0})  vs.  ${
          gameAreaController.blue?.userName
        } (${blue ? Math.round(blue.elo) : 0})`}
      </span>
      <ModalCloseButton />
    </div>
  );
}

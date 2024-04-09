import { Button, ModalCloseButton, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import PlayerController from '../../../../classes/PlayerController';
import useTownController from '../../../../hooks/useTownController';
import { GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import {
  battleshipLogo,
  joinGameButton,
  soloGameButton,
  startGameButton,
} from './BattleshipMenuSprites';

export default function BattleshipMenu({
  gameAreaController,
  interactableID,
}: {
  gameAreaController: BattleShipAreaController;
  interactableID: InteractableID;
}): JSX.Element {
  const townController = useTownController();

  const [blue, setBlue] = useState<PlayerController | undefined>(gameAreaController.blue);
  const [blueReady, setBlueReady] = useState(false);
  const [green, setGreen] = useState<PlayerController | undefined>(gameAreaController.green);
  const [greenReady, setGreenReady] = useState(false);
  const [joiningGame, setJoiningGame] = useState(false);

  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [moveCount, setMoveCount] = useState<number>(gameAreaController.moveCount);
  const toast = useToast();

  useEffect(() => {
    const updateGameState = () => {
      setBlue(gameAreaController.blue);
      setGreen(gameAreaController.green);
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setMoveCount(gameAreaController.moveCount || 0);
    };
    const onGameEnd = () => {
      const winner = gameAreaController.winner;
      if (!winner) {
        toast({
          title: 'Game over',
          description: 'Game ended in a tie',
          status: 'info',
        });
      } else if (winner === townController.ourPlayer) {
        toast({
          title: 'Game over',
          description: 'You won!',
          status: 'success',
        });
      } else {
        toast({
          title: 'Game over',
          description: `You lost :(`,
          status: 'error',
        });
      }
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    gameAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      gameAreaController.removeListener('gameUpdated', updateGameState);
      gameAreaController.removeListener('gameEnd', onGameEnd);
    };
  }, [townController, gameAreaController, toast]);

  return (
    <div
      style={{
        width: 661,
        height: 514,
        border: '3px solid black',
        borderRadius: 15,
        backgroundColor: '#6F6F78',
        position: 'absolute',
      }}>
      <span
        style={{
          position: 'relative',
          width: 500,
          height: 250,
          left: '25%',
          top: '5%',
        }}>
        {battleshipLogo}
      </span>
      <span
        style={{
          position: 'relative',
          left: '3%',
          top: '18%',
          bottom: '2%',
        }}>
        <div
          style={{
            backgroundColor: '#1C1C1C',
            color: '#24FF00',
            borderRadius: 10,
            width: 288,
            height: 46,
            fontSize: '1.4rem',
            paddingLeft: 10,
            paddingTop: 4,
            marginBottom: 10,
          }}>
          {green?.userName || ''}
        </div>
        <div
          style={{
            backgroundColor: '#1C1C1C',
            color: '#24FF00',
            borderRadius: 10,
            width: 288,
            height: 46,
            paddingLeft: 10,
            paddingTop: 4,
            fontSize: '1.4rem',
          }}>
          {blue?.userName || ''}
        </div>
      </span>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          width: 160,
          height: 241,
          backgroundColor: '#58585B',
          borderRadius: 10,
          left: '70%',
          bottom: '2%',
        }}>
        <span
          onClick={async () => {
            setJoiningGame(true);
            try {
              await gameAreaController.joinGame();
              if (gameAreaController.blue === townController.ourPlayer) {
                setBlueReady(true);
              } else {
                setGreenReady(false);
              }
            } catch (err) {
              toast({
                title: 'Error joining game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningGame(false);
          }}
          style={{ cursor: 'pointer' }}>
          {joinGameButton}
        </span>
        <span
          onClick={async () => {
            setJoiningGame(true);
            try {
              await gameAreaController.startGame();
            } catch (err) {
              toast({
                title: 'Error starting game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningGame(false);
          }}
          style={{ cursor: 'pointer' }}>
          {startGameButton}
        </span>
        <span
          style={{
            cursor: 'pointer',
          }}>
          {soloGameButton}
        </span>
      </div>
      <ModalCloseButton />
    </div>
  );
}

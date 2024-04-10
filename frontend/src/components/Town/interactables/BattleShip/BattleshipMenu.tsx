import { ModalCloseButton, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import PlayerController from '../../../../classes/PlayerController';
import useTownController from '../../../../hooks/useTownController';
import { BattleshipTheme, InteractableID } from '../../../../types/CoveyTownSocket';
import {
  battleshipLogo,
  changeThemeButton,
  joinGameButton,
  soloGameButton,
  startGameButton,
} from './BattleshipMenuSprites';

export default function BattleshipMenu({
  gameAreaController,
}: {
  gameAreaController: BattleShipAreaController;
  interactableID: InteractableID;
}): JSX.Element {
  const townController = useTownController();

  const [blue, setBlue] = useState<PlayerController | undefined>(gameAreaController.blue);
  const [green, setGreen] = useState<PlayerController | undefined>(gameAreaController.green);
  const [theme, setTheme] = useState<BattleshipTheme>(gameAreaController.theme);
  const toast = useToast();

  const handleThemeSwitch = async () => {
    await gameAreaController.changeTheme(theme === 'Military' ? 'Barbie' : 'Military');
  };

  useEffect(() => {
    const updateGameState = () => {
      setBlue(gameAreaController.blue);
      setGreen(gameAreaController.green);
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
    const updateTheme = () => {
      setTheme(gameAreaController.theme);
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    gameAreaController.addListener('gameEnd', onGameEnd);
    gameAreaController.addListener('themeChanged', updateTheme);
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
            overflow: 'hidden',
            fontFamily: 'Digital Numbers Regular',
          }}>
          {green?.userName.substring(0, 15) || ''}
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
            overflow: 'hidden',
            fontFamily: 'Digital Numbers Regular',
          }}>
          {blue?.userName.substring(0, 15) || ''}
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
            try {
              await gameAreaController.joinGame();
            } catch (err) {
              toast({
                title: 'Error joining game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
          }}
          style={{ cursor: 'pointer' }}>
          {joinGameButton}
        </span>
        <span
          onClick={async () => {
            try {
              await gameAreaController.startGame();
            } catch (err) {
              toast({
                title: 'Error starting game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
          }}
          style={{ cursor: 'pointer' }}>
          {startGameButton}
        </span>
        <span
          onClick={async () => {
            try {
              await gameAreaController.soloGame();
            } catch (err) {
              toast({
                title: 'Error initiating solo game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
          }}
          style={{ cursor: 'pointer' }}>
          {soloGameButton}
        </span>
      </div>
      <span
        onClick={handleThemeSwitch}
        style={{
          cursor: 'pointer',
          position: 'absolute',
          left: '10%',
          bottom: '15%',
          width: 127,
          height: 59,
        }}>
        {changeThemeButton}
      </span>
      <span
        style={{
          position: 'absolute',
          fontSize: '1.5rem',
          left: '20%',
          bottom: '10%',
        }}>
        <p
          style={{
            rotate: '-20deg',
            width: 'fitContent',
            fontFamily: 'Scribble',
            fontSize: '2rem',
          }}>
          {`Current theme - ${theme || 'None'}`}
        </p>
      </span>
      <ModalCloseButton />
    </div>
  );
}

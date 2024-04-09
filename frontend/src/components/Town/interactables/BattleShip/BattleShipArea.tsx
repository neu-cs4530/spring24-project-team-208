import { GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import React, { useEffect, useState } from 'react';
import { useInteractableAreaController } from '../../../../classes/TownController';
import BattleShipAreaController from '../../../../classes/interactable/BattleShipAreaController';
import useTownController from '../../../../hooks/useTownController';
import PlayerController from '../../../../classes/PlayerController';
import { Button, List, ListItem, useToast } from '@chakra-ui/react';
import BattleShipOwnBoard from './BattleShipOwnBoard';
import BattleShipOpponentBoard from './BattleShipOpponentBoard';
import BattleshipMenu from './BattleshipMenu';
import BattleshipEndScreen from './BattleshipEndScreen';

/**
 * The BattleShipArea component renders the Battleship game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the BattleShipAreaController to get the current state of the game.
 * It listens for the 'gameUpdated' and 'gameEnd' events on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 *
 * It renders the following:
 * - A list of players' usernames (in a list with the aria-label 'list of players in the game', one item for blue and one for green)
 *    - If there is no player in the game, the username is '(No player yet!)'
 *    - List the players as (exactly) `Blue: ${username}` and `Green: ${username}`
 * - A message indicating the current game status:
 *    - If the game is in progress, the message is 'Game in progress, {moveCount} moves in, currently {whoseTurn}'s turn'. If it is currently our player's turn, the message is 'Game in progress, {moveCount} moves in, currently your turn'
 *    - If the game is in status WAITING_FOR_PLAYERS, the message is 'Waiting for players to join'
 *    - If the game is in status WAITING_TO_START, the message is 'Waiting for players to press start'
 *    - If the game is in status OVER, the message is 'Game over'
 * - If the game is in status WAITING_FOR_PLAYERS or OVER, a button to join the game is displayed, with the text 'Join New Game'
 *    - Clicking the button calls the joinGame method on the gameAreaController
 *    - Before calling joinGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the player joins the game, the button dissapears
 * - If the game is in status WAITING_TO_START, a button to start the game is displayed, with the text 'Start Game'
 *    - Clicking the button calls the startGame method on the gameAreaController
 *    - Before calling startGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the game starts, the button dissapears
 * - The BattleShipBoard component, which is passed the current gameAreaController as a prop (@see BattleShipBoard.tsx)
 *
 * - When the game ends, a toast is displayed with the result of the game:
 *    - Our player won: description 'You won!'
 *    - Our player lost: description 'You lost :('
 *
 */
export default function BattleShipArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<BattleShipAreaController>(interactableID);
  const townController = useTownController();

  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const toast = useToast();
  useEffect(() => {
    const updateGameState = () => {
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
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
        setGameWon(true);
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

  useEffect(() => {
    const delay = 5000;
    const timeoutId = setTimeout(() => {
      setGameWon(false);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [gameWon]);
  return (
    <>
      {gameWon ? (
        <BattleshipEndScreen />
      ) : gameStatus === 'WAITING_FOR_PLAYERS' ||
        gameStatus === 'WAITING_TO_START' ||
        gameStatus === 'OVER' ? (
        <BattleshipMenu gameAreaController={gameAreaController} interactableID={interactableID} />
      ) : (
        <BattleShipOwnBoard gameAreaController={gameAreaController} />
      )}
    </>
  );
}

import React, { useEffect, useState } from 'react';
import BattleShipAreaController from '../../../../../classes/interactable/BattleShipAreaController';
import {
  BattleShipDatabaseEntry,
  BattleShipGameOutcome,
} from '../../../../../types/CoveyTownSocket';
import getBattleShipData from '../../../../Database';
import { largeNotebook } from '../BattleshipMenuSprites';

// .hover-shadow {
//     transition: box-shadow 0.3s;
//     }

//   .hover-shadow:hover {
//     box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
//   }

export function CheatSheetNoteBookModal({ controller }: { controller: BattleShipAreaController }) {
  const [gameData, setGameData] = useState<BattleShipDatabaseEntry | null>(null);
  const username =
    controller.whatColor === 'Blue' ? controller.blue?.userName : controller.green?.userName;

  // useEffect(() => {
  //   const getData = async () => {
  //     const data = await getBattleShipData(username || '');
  //     setGameData(data);
  //   };
  //   getData();
  // }, [username]);
  return (
    <>
      <span
        style={{
          position: 'absolute',
          width: 800,
        }}>
        <span
          style={{
            position: 'relative',
          }}>
          {largeNotebook}
        </span>
        <span
          style={{
            position: 'absolute',
            top: '15%',
            left: '53%',
          }}>
          {`Current ELO: ${gameData?.elo || 0}`}
        </span>
        <span
          style={{
            position: 'absolute',
            top: '22%',
            left: '53%',
          }}>
          {`Total Wins: ${gameData?.wins || 0}`}
        </span>
        <span
          style={{
            position: 'absolute',
            top: '29%',
            left: '53%',
          }}>
          {`Total Losses: ${gameData?.losses || 0}`}
        </span>
        <span
          style={{
            position: 'absolute',
            top: '40%',
            left: '54%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <p style={{ fontSize: '1.5rem', textDecoration: 'underline' }}>Previous Games</p>
          {gameData?.history && gameData?.history.length > 0 ? (
            gameData?.history.map((result: BattleShipGameOutcome, index: number) => (
              <p
                key={index}
                style={{
                  fontSize: '.7rem',
                }}>
                {`${username} vs. ${result.opponent} - ${result.result}`}
              </p>
            ))
          ) : (
            <p>No Previous Games</p>
          )}
        </span>
      </span>
    </>
  );
}

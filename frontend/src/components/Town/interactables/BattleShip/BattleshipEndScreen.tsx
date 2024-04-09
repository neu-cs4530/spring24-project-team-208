import React from "react";
import { battleshipWinnerLogo, newGameButton } from "./BattleshipMenuSprites";

export default function BattleshipEndScreen() {
  return (
    <div
      style={{
        width: 661,
        height:514,
        border: '3px solid black',
        borderRadius: 15,
        backgroundColor: '#6F6F78',
        position: 'absolute',
      }}>
      <span
        style={{
          position: 'relative',
          left: '17%',
        }}>
        {battleshipWinnerLogo}
      </span>
      <span
        style={{
          position: 'relative',
          fontWeight: 'bold',
          fontSize: '5rem',
          left: '18%',
          top: '7%',
          color: 'gold',
        }}>
        YOU WIN!!!!
      </span>
      {/* <span
        style={{
          position: 'relative',
        }}>
          {newGameButton}
      </span> */}
    </div>
  );
}
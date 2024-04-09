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
        }}>
        {battleshipWinnerLogo}
      </span>
      <span
        style={{
          position: 'relative',
        }}>
          {newGameButton}
      </span>
    </div>
  );
}
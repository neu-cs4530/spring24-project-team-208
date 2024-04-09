import React from 'react';
const CELL_SIZE = 54;

export const crosshair = (
  <img
    src='./battleship_sprites/BattleshipMenuSprites/Crosshair.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />
);

export const scratch = (
  <img
    src='./battleship_sprites/BattleshipMenuSprites/Scratch.png'
    style={{
      height: 20,
      width: 100,
      position: 'absolute',
      top: '15%',
      right: `${Math.random() * 10 + 10}%`,
      rotate: '5deg',
    }}
  />
);

export const smallNotebook = (
  <img src='./battleship_sprites/BattleshipMenuSprites/Small_Notebook.png' style={{ width: 180 }} />
);

export const largeNotebook = (
  <img src='./battleship_sprites/BattleshipMenuSprites/Large_Notebook.png' />
);

export const notebookExit = (
  <img src='./battleship_sprites/BattleshipMenuSprites/Notebook_Exit.png' />
);

export const battleshipLogo = (
  <img
    src='./battleship_sprites/BattleshipMenuSprites/Battleship_Logo.png'
    style={{ width: 300, height: 140 }}
  />
);

export const awaitingButton = (
  <img
    src='./battleship_sprites/BattleshipMenuSprites/awaiting.png'
    style={{ width: 40, height: 30 }}
  />
);

export const readyButton = (
  <img
    src='./battleship_sprites/BattleshipMenuSprites/ready.png'
    style={{ width: 40, height: 30 }}
  />
);

export const joinGameButton = (
  <img
    src='./battleship_sprites/BattleshipMenuSprites/Join_Game_Button.png'
    style={{ width: 127, height: 59 }}
  />
);

export const startGameButton = (
  <img
    src='./battleship_sprites/BattleshipMenuSprites/Start_Game_Button.png'
    style={{ width: 127, height: 59 }}
  />
);

export const soloGameButton = (
  <img
    src='./battleship_sprites/BattleshipMenuSprites/Solo_Game_Button.png'
    style={{ width: 127, height: 59 }}
  />
);

export const newGameButton = (
  <img
    src='./battleship_sprites/BattleshipMenuSprites/New_Game_Button.png'
    style={{ width: 127, height: 59 }}
  />
)

export const gameOptionBackground = (
  <img
    src='./battleship_sprites/BattleshipMenuSprites/Menu_Buttons_Background.png'
    style={{ width: 160, height: 241 }}
  />
);

export const battleshipWinnerLogo = (
  <img
    src='./battleship_sprites/BattleshipMenuSprites/Battleship_Winners_Logo.png'
    style={{ width: 466, height: 270 }}
  />
);

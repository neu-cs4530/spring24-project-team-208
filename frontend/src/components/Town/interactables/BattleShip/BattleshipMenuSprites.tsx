import React from 'react';
import { Image } from '@chakra-ui/react';
const CELL_SIZE = 54;

export const crosshair = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/Crosshair.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />
);

export const scratch = (
  <Image
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
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/Small_Notebook.png'
    style={{ width: 180 }}
  />
);

export const largeNotebook = (
  <Image src='./battleship_sprites/BattleshipMenuSprites/Open_Notebook.png' />
);

export const notebookExit = (
  <Image src='./battleship_sprites/BattleshipMenuSprites/Notebook_Exit.png' />
);

export const battleshipLogo = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/Battleship_Logo.png'
    style={{ width: 300, height: 140 }}
  />
);

export const awaitingButton = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/awaiting.png'
    style={{ width: 40, height: 30 }}
  />
);

export const readyButton = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/ready.png'
    style={{ width: 40, height: 30 }}
  />
);

export const joinGameButton = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/Join_Game_Button.png'
    style={{ width: 127, height: 59 }}
  />
);

export const startGameButton = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/Start_Game_Button.png'
    style={{ width: 127, height: 59 }}
  />
);

export const soloGameButton = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/Solo_Game_Button.png'
    style={{ width: 127, height: 59 }}
  />
);

export const newGameButton = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/New_Game_Button.png'
    style={{ width: 127, height: 59 }}
  />
);

export const changeThemeButton = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/Change_Theme_Button.png'
    style={{ width: 127, height: 59 }}
  />
);

export const gameOptionBackground = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/Menu_Buttons_Background.png'
    style={{ width: 160, height: 241 }}
  />
);

export const battleshipWinnerLogo = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/Battleship_Winners_Logo.png'
    style={{ width: 466, height: 270 }}
  />
);

export const verticalSwitch = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/Vertical_Switch.png'
    style={{ width: 75, height: 75 }}
  />
);

export const verticalSwitchLever = (
  <Image
    src='./battleship_sprites/BattleshipMenuSprites/Vertical_Switch_Lever.png'
    style={{ width: 75, height: 75 }}
  />
);

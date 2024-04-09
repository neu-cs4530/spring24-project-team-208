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

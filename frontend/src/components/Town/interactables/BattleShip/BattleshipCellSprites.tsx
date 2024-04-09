import React from 'react';
import { Image } from '@chakra-ui/react';
const CELL_SIZE = 54;

export const BATTLESHIP_PIECE_STORE = [
  {
    name: 'Aircraft_Back',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Aircraft_Back.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Aircraft_Middle_1',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Aircraft_Middle.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Aircraft_Middle_2',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Aircraft_Middle.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Aircraft_Front',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Aircraft_Front.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Battleship_Back',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Battleship_Back.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Battleship_Middle_1',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Battleship_Middle_1.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Battleship_Middle_2',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Battleship_Middle_2.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Battleship_Middle_3',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Battleship_Middle_3.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Battleship_Front',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Battleship_Front.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Cruiser_Back',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Cruiser_Back.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Cruiser_Front',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Cruiser_Front.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Destroyer',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Destroyer.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Submarine_Back',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Submarine_Back.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Submarine_Middle',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Submarine_Middle.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
  {
    name: 'Submarine_Front',
    component: (
      <Image
        src='./battleship_sprites/BattleshipCellSprites/Submarine_Front.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE }}
      />
    ),
  },
];

export const OCEAN_STORE = [
  <Image
    key='1'
    src='./battleship_sprites/BattleshipCellSprites/Ocean_1.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />,
  <Image
    key='2'
    src='./battleship_sprites/BattleshipCellSprites/Ocean_2.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />,
  <Image
    key='3'
    src='./battleship_sprites/BattleshipCellSprites/Ocean_3.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />,
  <Image
    key='4'
    src='./battleship_sprites/BattleshipCellSprites/Ocean_4.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />,
];

export const fireOverlay = (
  <Image
    src='./battleship_sprites/BattleshipCellSprites/Fire.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />
);

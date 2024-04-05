import React from 'react';
const CELL_SIZE = 54;

export const BATTLESHIP_PIECE_STORE = [
  {
    name: 'Aircraft_Back',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Aircraft_Back.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Aircraft_Middle_1',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Aircraft_Middle.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Aircraft_Middle_2',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Aircraft_Middle.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Aircraft_Front',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Aircraft_Front.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Battleship_Back',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Battleship_Back.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Battleship_Middle_1',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Battleship_Middle_1.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Battleship_Middle_2',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Battleship_Middle_2.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Battleship_Middle_3',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Battleship_Middle_3.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Battleship_Front',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Battleship_Front.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Cruiser_Back',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Cruiser_Back.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Cruiser_Front',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Cruiser_Front.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Destroyer',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Destroyer.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Submarine_Back',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Submarine_Back.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Submarine_Middle',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Submarine_Middle.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
  {
    name: 'Submarine_Front',
    component: (
      <img
        src='./battleship_sprites/BattleshipCellSprites/Submarine_Front.png'
        style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
      />
    ),
  },
];

export const OCEAN_STORE = [
  <img
    key='1'
    src='./battleship_sprites/BattleshipCellSprites/Ocean_1.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />,
  <img
    key='2'
    src='./battleship_sprites/BattleshipCellSprites/Ocean_2.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />,
  <img
    key='3'
    src='./battleship_sprites/BattleshipCellSprites/Ocean_3.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />,
  <img
    key='4'
    src='./battleship_sprites/BattleshipCellSprites/Ocean_4.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />,
];

export const fireOverlay = (
  <img
    src='./battleship_sprites/BattleshipCellSprites/Fire.png'
    style={{ height: CELL_SIZE, width: CELL_SIZE, position: 'absolute' }}
  />
);

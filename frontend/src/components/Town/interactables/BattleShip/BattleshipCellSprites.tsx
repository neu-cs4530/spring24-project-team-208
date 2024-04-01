const Cell_SIZE = 54

export const BattleShipPieceStore = [
    {
        name: "Aircraft_Back",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Aircraft_Back.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Aircraft_Middle_1",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Aircraft_Middle.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Aircraft_Middle_2",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Aircraft_Middle.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Aircraft_Front",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Aircraft_Front.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Battleship_Back",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Battleship_Back.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Battleship_Middle_1",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Battleship_Back.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Battleship_Middle_2",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Battleship_Middle_2.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Battleship_Middle_3",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Battleship_Middle_3.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Battleship_Front",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Battleship_Front.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Cruiser_Back",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Cruiser_Back.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Cruiser_Front",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Cruiser_Front.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Destroyer",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Destroyer.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Submarine_Back",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Submarine_Back.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Submarine_Middle",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Submarine_Middle.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    },
    {
        name: "Submarine_Front",
        component: <img src='./battleship_sprites/BattleshipCellSprites/Submarine_Front.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
    }
]

export const OceanStore = [
    <img src='./battleship_sprites/BattleshipCellSprites/Ocean_1.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />,
    <img src='./battleship_sprites/BattleshipCellSprites/Ocean_2.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />,
    <img src='./battleship_sprites/BattleshipCellSprites/Ocean_3.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />,
    <img src='./battleship_sprites/BattleshipCellSprites/Ocean_4.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
]

export const FireOverlay = (
    <img src='./battleship_sprites/BattleshipCellSprites/Fire.png' style={{ height: Cell_SIZE, width: Cell_SIZE, position: 'absolute' }} />
)
const Cell_SIZE = 54

export const BattleShipPieceStore = [
    {
        name: "Aircraft_Back",
        component: <img src='./BattleshipCellSprites/Aircraft_Back' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Aircraft_Middle_1",
        component: <img src='./BattleshipCellSprites/Aircraft_Middle.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Aircraft_Middle_2",
        component: <img src='./BattleshipCellSprites/Aircraft_Middle.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Aircraft_Front",
        component: <img src='./BattleshipCellSprites/Aircraft_Front.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Battleship_Back",
        component: <img src='./BattleshipCellSprites/Battleship_Back.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Battleship_Middle_1",
        component: <img src='./BattleshipCellSprites/Battleship_Back.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Battleship_Middle_2",
        component: <img src='./BattleshipCellSprites/Battleship_Middle_2.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Battleship_Middle_3",
        component: <img src='./BattleshipCellSprites/Battleship_Middle_3.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Battleship_Front",
        component: <img src='./BattleshipCellSprites/Battleship_Front.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Cruiser_Back",
        component: <img src='./BattleshipCellSprites/Cruiser_Back.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Cruiser_Front",
        component: <img src='./BattleshipCellSprites/Cruiser_Front.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Destroyer",
        component: <img src='./BattleshipCellSprites/Destroyer.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Submarine_Back",
        component: <img src='./BattleshipCellSprites/Submarine_Back.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Submarine_Middle",
        component: <img src='./BattleshipCellSprites/Submarine_Middle.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    },
    {
        name: "Submarine_Front",
        component: <img src='./BattleshipCellSprites/Submarine_Front.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
    }
]

export const OceanStore = [
    <img src='./BattleshipCellSprites/Ocean_1.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />,
    <img src='./BattleshipCellSprites/Ocean_2.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />,
    <img src='./BattleshipCellSprites/Ocean_3.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />,
    <img src='./BattleshipCellSprites/Ocean_4.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
]

export const FireOverlay = (
    <img src='./BattleshipCellSprites/Fire.png' style={{ height: Cell_SIZE, width: Cell_SIZE }} />
)
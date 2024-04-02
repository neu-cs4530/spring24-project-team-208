import { useState } from "react";
import { BattleShipCell } from "../../../../../types/CoveyTownSocket";
import { BattleShipPieceStore, FireOverlay, OceanStore } from "../BattleshipCellSprites";
import { Crosshair } from "../BattleshipMenuSprites";

const CELL_SIZE = 54;

export function BattleShipBoardCell(
  {
    cell, 
    chooseCell, 
    chosenCell
  } : {
    cell: BattleShipCell, 
    chooseCell: Function, 
    chosenCell: any
  }) {
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseEnter = () => {
      setIsHovered(true);
    }
    const handleMouseLeave = () => {
      setIsHovered(false);
    }
    const handleClick = () => {
      chooseCell(cell)
    }
    const hit = cell?.state === "Hit";
    return (
      <div 
        style={{ 
          height: CELL_SIZE,
          display: 'relative',
          width: CELL_SIZE,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {
          cell?.type === "Ocean" 
          ? OceanStore[Math.floor(Math.random() * OceanStore.length)] 
          : BattleShipPieceStore.find(piece => piece.name === cell?.type)?.component
        }
        {hit && FireOverlay}
        {(isHovered || cell === chosenCell) && Crosshair}
      </div>
    )
  }
import { useState } from "react";
import { BattleShipCell } from "../../../../../classes/interactable/BattleShipAreaController";
import { Cell_SIZE } from "../../../../../types/CoveyTownSocket";
import { BattleShipPieceStore, FireOverlay, OceanStore } from "../BattleshipCellSprites";
import { Crosshair } from "../BattleshipMenuSprites/BattleshipMenuSprites";

export function BattleShipBoardCell(
  {
    cell, 
    chooseCell, 
    chosenCell
  } 
  : 
  {
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
  
    let pieceImage: any;
    const hit = cell?.state === "Hit";
  
    if (cell?.type === "Ocean") {
      pieceImage = OceanStore[Math.random() * OceanStore.length];
    } else {
      pieceImage = BattleShipPieceStore.find(piece => piece.name === cell?.type)?.component;
    }
  
    return (
      <div 
        style={{ height: Cell_SIZE, width: Cell_SIZE }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {(isHovered || cell === chosenCell) && {Crosshair}}
        {hit && {FireOverlay}}
        {pieceImage}
      </div>
    )
  }
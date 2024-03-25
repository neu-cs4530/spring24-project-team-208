/*
    To avoid ripping-off the bandaid and switching to a proper multi-module workspace setup
    we are sharing type definitions only, using tsconfig.json "references" to the shared project.
    We still want to prevent relative package imports otherwise using ESLint, because importing anything
    besides type declarations could become problematic from a compilation perspective.
*/

import { Socket } from 'socket.io-client';
/* eslint-disable import/no-relative-packages */
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types/CoveyTownSocket.d';
/* eslint-disable import/no-relative-packages */
export * from '../../../shared/types/CoveyTownSocket.d';

export type CoveyTownSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * A BattleShipCell can either be "Ocean", representing 1 of 4 ocean tiles or a BattleShipCell, representing
 *  one of the many Battleship pieces. 
 * A BattleShipCell is either "Hit", meaning it has been chosen during a turn or "Safe", meaning it has not been.
 */
 export type BattleShipCell = {
    type: BattleshipBoat | "Ocean";
    state: BattleShipCellState;
    row: BattleShipRowIndex;
    col: BattleShipColIndex;
}

// The size of each cell square (in pixels)
export const Cell_SIZE = 40
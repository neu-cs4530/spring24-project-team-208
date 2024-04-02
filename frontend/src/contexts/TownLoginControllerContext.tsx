import React from 'react';
import TownController from '../classes/TownController';
import { TownsService } from '../generated/client';

export type TownLoginController = {
  setTownController: (newController: TownController | null) => void;
  townsService: TownsService;
};
/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useTownLoginController` hook.
 */
const context = React.createContext<TownLoginController | null>(null);

export default context;

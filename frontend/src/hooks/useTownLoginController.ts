import { useContext } from 'react';
import assert from 'assert';
import TownLoginControllerContext from '../contexts/TownLoginControllerContext';
import { TownLoginController } from '../contexts/TownLoginControllerContext';

/**
 * Use this hook to access the current TownLoginController.
 */
export default function useTownLoginController(): TownLoginController {
  const ctx = useContext(TownLoginControllerContext);
  assert(ctx, 'TownLoginController context should be defined.');
  return ctx;
}

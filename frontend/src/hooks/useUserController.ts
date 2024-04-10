import { useContext } from 'react';
import assert from 'assert';
import UserController from '../classes/UserController';
import UserControllerContext from '../contexts/UserControllerContext';

/**
 * Use this hook to access the current UserController. This state will change
 * when a user logs in or logs out. Use the controller to subscribe
 * to other kinds of events that take place within the context of a user.
 */
export default function useUserController(): UserController {
  const ctx = useContext(UserControllerContext);
  //assert(ctx, 'UserController context should be defined in order to use this hook.');
  return ctx!; // uncomment assertion and remove non-null assertion ! once user conroller is mocked properly in TownSelection tests
}

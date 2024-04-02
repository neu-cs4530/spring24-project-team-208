import { useContext } from 'react';
import assert from 'assert';
import UserLoginControllerContext from '../contexts/UserLoginControllerContext';
import { UserLoginController } from '../contexts/UserLoginControllerContext';

/**
 * Use this hook to access the current UserLoginController.
 */
export default function useUserLoginController(): UserLoginController {
  const ctx = useContext(UserLoginControllerContext);
  assert(ctx, 'UserLoginController context should be defined.');
  return ctx;
}

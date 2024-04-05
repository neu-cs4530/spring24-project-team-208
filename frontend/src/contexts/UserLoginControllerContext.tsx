import React from 'react';
import { UserController } from '../classes/UserController';
import { UsersService } from '../generated/client';

export type UserLoginController = {
  setUserController: (newController: UserController | null) => void;
  usersService: UsersService;
};
/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useUserLoginController` hook.
 */
const context = React.createContext<UserLoginController | null>(null);

export default context;

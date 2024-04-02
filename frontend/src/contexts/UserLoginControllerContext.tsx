import React from 'react';
import UserController from '../classes/UserController';

export type UserLoginController = {
  setUserController: (newController: UserController | null) => void;
};
/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useUserLoginController` hook.
 */
const context = React.createContext<UserLoginController | null>(null);

export default context;

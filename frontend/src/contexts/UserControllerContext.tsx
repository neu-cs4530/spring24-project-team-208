import React from 'react';
import UserController from '../classes/UserController';

/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useUserController` hook.
 */
const context = React.createContext<UserController | null>(null);

export default context;

import { User } from 'firebase/auth';

export type UserController = {
  username: string;
  user: User;
};

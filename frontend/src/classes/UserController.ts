import TypedEmitter from 'typed-emitter';
import EventEmitter from 'events';

// TODO: Flesh out this type
export type UserEvents = {
  connect: () => void;
  disconnect: () => void;
  joinTown: (townID: string) => void;
};

// TODO: Implement this class
export default class UserController extends (EventEmitter as new () => TypedEmitter<UserEvents>) {
  public async connect() {
    return null;
  }
}

import { User } from 'firebase/auth';
import { UserLoginController } from '../contexts/UserLoginControllerContext';
import { getAuth, signOut } from 'firebase/auth';

export default class UserController {
  private _user: User;

  private _userLoginController: UserLoginController;

  public constructor(user: User, userLoginController: UserLoginController) {
    this._user = user;
    this._userLoginController = userLoginController;
  }

  public get username(): string {
    return this._user.uid;
  }

  public get user(): User {
    return this._user;
  }

  public async getAuthToken(): Promise<string> {
    return this._user.getIdToken();
  }

  public async logOut(): Promise<void> {
    const auth = getAuth();
    await signOut(auth);
    this._userLoginController.setUserController(null);
  }
}

import { UserLoginParams, UserLoginResponse, UserSignUpParams } from '../api/UserModel';

/**
 * This is the class that implements the functionality of the Users route.
 */
export default class UsersService {
  /**
   * Sign up a new user
   *
   * @param request The email, password, and username for the new user
   * @returns The username and auth token for the new user
   * @throws InvalidParametersError if the request is invalid
   */
  public signUp(request: UserSignUpParams): Promise<UserLoginResponse> {
    throw new Error('Not implemented');
  }

  /**
   * Log in an existing user
   *
   * @param request The email and password for the user
   * @returns The username and auth token for the user
   * @throws InvalidParametersError if the request is invalid
   */
  public login(request: UserLoginParams): Promise<UserLoginResponse> {
    throw new Error('Not implemented');
  }
}

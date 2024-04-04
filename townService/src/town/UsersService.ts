import { UserSignUpParams } from '../api/UserModel';
import InvalidParametersError from '../lib/InvalidParametersError';
import { auth } from '../lib/firebaseSetup';

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
  public async signUp(request: UserSignUpParams): Promise<void> {
    try {
      await auth.createUser({
        uid: request.username,
        email: request.email,
        password: request.password,
      });
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'auth/invalid-email':
            throw new InvalidParametersError('Provided email is not a valid email address.');
          case 'auth/email-already-exists':
            throw new InvalidParametersError('An account for this email already exists.');
          case 'auth/invalid-password':
            throw new InvalidParametersError(
              'Password is invalid. It must be at least 6 characters long.',
            );
          case 'auth/invalid-uid':
            throw new InvalidParametersError(
              'Username is invalid. It must be nonempty and at most 128 characters long.',
            );
          case 'auth/uid-already-exists':
            throw new InvalidParametersError('Username is already taken.');
          default:
            throw error;
        }
      } else {
        throw error;
      }
    }
  }
}

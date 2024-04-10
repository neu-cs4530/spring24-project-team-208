import { Body, Controller, Post, Route, Tags, Response, SuccessResponse } from 'tsoa';
import { FirebaseError } from 'firebase-admin';

import { UserSignUpParams } from '../api/UserModel';
import { auth } from '../lib/firebaseSetup';
import InvalidParametersError from '../lib/InvalidParametersError';

function isFirebaseError(error: unknown): error is FirebaseError {
  return (error as FirebaseError).code !== undefined;
}

type ErrorMessageResponse = { message: string };

/**
 * This is the user route
 */
@Route('users')
@Tags('users')
// TSOA (which we use to generate the REST API from this file) does not support default exports, so the controller can't be a default export.
// eslint-disable-next-line import/prefer-default-export
export class UsersController extends Controller {
  /**
   * Sign up a new user
   *
   * @param request The email, password, and username for the new user
   * @example request {"email": "larrypage@gmail.com", "password": "larrysSuperSecretPassword", "username": "larrypagerocks"}
   */
  @SuccessResponse('201', 'Created')
  @Response<ErrorMessageResponse>(
    '422',
    'Invalid parameters provided for sign up:\n1. Username is not a nonempty string of at most 128 characters\n2. Username is already taken\n3. Provided email is not a valid email address\n4. An account for this email already exists\n5. Password is too short',
    { message: 'Provided email is not a valid email address.' },
  )
  @Post('auth/signUp')
  public async signUp(@Body() request: UserSignUpParams): Promise<void> {
    try {
      await auth.createUser({
        uid: request.username,
        email: request.email,
        password: request.password,
      });
    } catch (error) {
      if (isFirebaseError(error)) {
        switch (error.code) {
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
            throw new Error(error.message);
        }
      } else {
        throw error;
      }
    }
  }
}

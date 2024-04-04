import { Body, Controller, Post, Route, Tags, Response } from 'tsoa';
import InvalidParametersError from '../lib/InvalidParametersError';

import { UserSignUpParams } from '../api/UserModel';
import UsersService from './UsersService';

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
  @Response<InvalidParametersError>(
    '422',
    'Invalid parameters provided for sign up:\n1. Username is not a nonempty string of at most 128 characters\n2. Username is already taken\n3. Provided email is not a valid email address\n4. An account for this email already exists\n5. Password is too short',
  )
  @Post('auth/signUp')
  public async signUp(@Body() request: UserSignUpParams): Promise<void> {
    new UsersService().signUp(request);
  }
}

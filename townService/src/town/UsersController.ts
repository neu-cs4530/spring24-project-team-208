import { Body, Controller, Example, Post, Route, Tags, Response } from 'tsoa';
import InvalidParametersError from '../lib/InvalidParametersError';

import { UserSignUpParams, UserLoginParams, UserLoginResponse } from '../api/UserModel';
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
   * @returns The username and auth token for the new user
   */
  @Example<UserLoginResponse>({ username: 'larrypagerocks', authToken: 'loremipsum' })
  @Response<InvalidParametersError>(
    '422',
    'Invalid parameters provided for sign up:\n1. Username is not a string of at least 3 characters\n2. Username is already taken\n3. Provided email is not a valid email address\n4. An account for this email already exists\n5. Password is too short',
  )
  @Post('auth/signUp')
  public async signUp(@Body() request: UserSignUpParams): Promise<UserLoginResponse> {
    return new UsersService().signUp(request);
  }

  /**
   * Log in an existing user
   *
   * @param request The email and password of the user
   * @example request {"email": "larrypage@gmail.com", "password": "larrysSuperSecretPassword"}
   * @returns The username and auth token for the user
   */
  @Example<UserLoginResponse>({ username: 'larrypagerocks', authToken: 'loremipsum' })
  @Response<InvalidParametersError>(
    '422',
    'Invalid parameters provided for login:\n1. Provided email is not a valid email address\n2. No account found for this email address\n3. Password is incorrect',
  )
  @Post('auth/login')
  public async login(@Body() request: UserLoginParams): Promise<UserLoginResponse> {
    return new UsersService().login(request);
  }
}

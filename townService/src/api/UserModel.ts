/**
 * Payload that is sent back to the client after a successful login
 */
export interface UserLoginResponse {
  /**
   * The token that the client must use to authenticate future requests
   */
  authToken: string;
  /**
   * The username of the player who logged in
   */
  username: string;
}

/**
 * Request body that specifies how to log in a user
 */
export interface UserLoginParams {
  /**
   * The email address of the user
   */
  email: string;
  /**
   * The password of the user
   */
  password: string;
}

/**
 * Request body that specifies how to sign up a user
 */
export interface UserSignUpParams {
  /**
   * The email address of the user
   */
  email: string;
  /**
   * The password of the user
   */
  password: string;
  /**
   * The username of the user
   */
  username: string;
}

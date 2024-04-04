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

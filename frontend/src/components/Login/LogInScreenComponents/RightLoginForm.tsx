import {
  Flex,
  Box,
  Button,
  FormControl,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Spacer,
  Stack,
  useToast,
  ToastId,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import auth from '../../../firebaseSetup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import UserController from '../../../classes/UserController';
import { ApiError } from '../../../generated/client';
import { FirebaseError } from '@firebase/util';
import useUserLoginController from '../../../hooks/useUserLoginController';

/**
 * The right log in form renders the right-hand side of the log in screen.
 * It renders the log in form for users to enter their log in credentials and also renders a signup form if users do not have an account.
 *
 * It uses Chakra-UI components (does not use other GUI widgets) and firebase for authentication.
 *
 * It renders the following:
 * - A welcome message
 *    - If the user wants to log in, the title is 'Welcome! Log in to get started.'
 *    - If the user wants to sign up, the title is 'Welcome! Sign up to join our community.'
 * - A log in form for users to enter their log in credentials
 *    - The form has two input fields: one for the email address and one for the password
 *      - The password input field has a 'show password' button that toggles the visibility of the password
 *    - When the user attempts to log in, a toast will appear with an error message if the input is incorrect or the log in stalls
 *      - If the user forgets to enter an email, the message is 'Unable to log in. Please input an email'
 *      - If the user forgets to enter a password, the message is 'Unable to log in. Please input a password'
 *      - If the user does not exist or another error occurs, the message is 'Unable to log in. ${error}'
 *      - If the log in stalls, the message is 'Logging in...This is taking a bit longer than normal - please be patient...'
 *        with a delay of 2000ms
 * - A signup form for users to create a new account
 *    - The form has three input fields: one for the email address, one for the username, and one for the password
 *      - The password input field has a 'show password' button that toggles the visibility of the password
 *    - When the user attempts to sign up, a toast will appear with an error message if the input is incorrect or the sign up stalls
 *      - If the user forgets to enter an email, the message is 'Unable to sign up. Please input an email'
 *      - If the user forgets to enter an username, the message is 'Unable to sign up. Please input a username'
 *      - If the user forgets to enter a password, the message is 'Unable to sign up. Please input a password'
 *      - If the user does not exist or another error occurs, the message is 'Unable to sign up. ${error}'
 *      - If the log in stalls, the message is 'Signing up...This is taking a bit longer than normal - please be patient...'
 *        with a delay of 2000ms
 * - A button to switch between the log in and signup forms
 *    - If the user wants to log in, the button text is 'Log in' and the preceeding text says 'Don't have an account?'
 *    - If the user wants to sign up, the button text is 'Sign up' and the preceeding text says 'Already have an account?'
 */
export default function RightLogInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const userLogInController = useUserLoginController();
  const { setUserController, usersService } = userLogInController;

  const toast = useToast();
  const handleShowPasswordClick = () => setShowPassword(!showPassword);
  const handleShowSignUp = () => setShowSignUp(!showSignUp);

  const handleFirebaseLogIn = async (): Promise<UserController | undefined> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const newUserController = new UserController(userCredential.user, userLogInController);
      return newUserController;
    } catch (error) {
      if (error instanceof FirebaseError) {
        let message: string;
        switch (error.code) {
          case 'auth/user-not-found':
            message = 'No account associated with this email.';
            break;
          case 'auth/wrong-password':
            message = 'Incorrect password.';
            break;
          case 'auth/invalid-email':
            message = 'The provided email address is not a valid email address.';
            break;
          case 'auth/user-disabled':
            message = 'The account associated with this email has been disabled.';
            break;
          case 'auth/invalid-credential':
            message = 'Either the email or password is incorrect.';
            break;
          case 'auth/too-many-requests':
            message = 'Wait a moment before trying again.';
            break;
          default:
            message = 'Error contacting the authentication server. Please try again later.';
            break;
        }
        toast({
          title: 'Unable to log in',
          description: message,
          status: 'error',
        });
      }
    }
  };

  const handleLogIn = async () => {
    if (!email || email.length === 0) {
      toast({
        title: 'Unable to log in',
        description: 'Please input an email',
        status: 'error',
      });
      return;
    }
    if (!password || password.length === 0) {
      toast({
        title: 'Unable to log in',
        description: 'Please input a password',
        status: 'error',
      });
      return;
    }
    let loadingToast: ToastId | undefined = undefined;
    const connectWatchdog = setTimeout(() => {
      loadingToast = toast({
        title: 'Logging in...',
        description: 'This is taking a bit longer than normal - please be patient...',
        status: 'info',
        isClosable: false,
        duration: null,
      });
    }, 2000);
    setIsLoggingIn(true);
    try {
      const userController = await handleFirebaseLogIn();
      clearTimeout(connectWatchdog);
      setIsLoggingIn(false);
      if (loadingToast) {
        toast.close(loadingToast);
      }
      if (userController !== undefined) {
        setUserController(userController);
      }
    } catch (err) {
      clearTimeout(connectWatchdog);
      setIsLoggingIn(false);
      if (loadingToast) {
        toast.close(loadingToast);
      }
      if (err instanceof Error) {
        toast({
          title: 'Unable to log in',
          description: err.toString(),
          status: 'error',
        });
      } else {
        console.trace(err);
        toast({
          title: 'Unexpected error, see browser console for details.',
          status: 'error',
        });
      }
    }
  };

  const handleSignUp = async () => {
    if (!email || email.length === 0) {
      toast({
        title: 'Unable to sign up',
        description: 'Please input an email',
        status: 'error',
      });
      return;
    }
    if (!password || password.length === 0) {
      toast({
        title: 'Unable to sign up',
        description: 'Please input a password',
        status: 'error',
      });
      return;
    }
    if (!username || username.length === 0) {
      toast({
        title: 'Unable to sign up',
        description: 'Please input a username',
        status: 'error',
      });
      return;
    }
    let loadingToast: ToastId | undefined = undefined;
    const connectWatchdog = setTimeout(() => {
      loadingToast = toast({
        title: 'Signing up...',
        description: 'This is taking a bit longer than normal - please be patient...',
        status: 'info',
        isClosable: false,
        duration: null,
      });
    }, 2000);
    setIsSigningUp(true);
    try {
      await usersService.signUp({ email: email, password: password, username: username });
      const userController = await handleFirebaseLogIn();
      clearTimeout(connectWatchdog);
      setIsSigningUp(false);
      if (loadingToast) {
        toast.close(loadingToast);
      }
      if (userController !== undefined) {
        setUserController(userController);
      }
    } catch (err) {
      clearTimeout(connectWatchdog);
      setIsSigningUp(false);
      if (loadingToast) {
        toast.close(loadingToast);
      }
      if (err instanceof ApiError && err.status === 422) {
        toast({
          title: 'Unable to log in',
          description: err.body.message,
          status: 'error',
        });
      } else {
        console.trace(err);
        toast({
          title: 'Unexpected error, see browser console for details.',
          status: 'error',
        });
      }
    }
  };

  const handleSignUpButton = async () => {
    await handleSignUp();
  };

  const handleLogInButton = async () => {
    await handleLogIn();
  };

  return (
    <>
      {' '}
      <Box flex='3' w='full' h='100vh' bg='white'>
        <Flex
          flexDirection='column'
          width='100wh'
          height='100vh'
          backgroundColor='white'
          justifyContent='center'
          alignItems='center'>
          <Stack flexDir='column' mb='2' justifyContent='center'>
            <Box textAlign='start' mb='-0.25rem' ms={2}>
              <Heading fontSize='2em' color='gray.400'>
                Welcome!
              </Heading>
              <Heading fontSize='2em' color='gray.600'>
                {showSignUp ? 'Sign up to join our community.' : 'Log in to get started.'}
              </Heading>
            </Box>
            <Spacer />
            <Spacer />
            <Box minW={{ base: '90%', md: '500px' }}>
              <form>
                <Stack spacing={4} p='1rem' backgroundColor='whiteAlpha.900' boxShadow='lg'>
                  {showSignUp && (
                    <>
                      <FormControl>
                        <InputGroup>
                          <Input
                            type='text'
                            placeholder='Username'
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                          />
                        </InputGroup>
                      </FormControl>
                    </>
                  )}
                  <FormControl>
                    <InputGroup>
                      <Input
                        type='email'
                        placeholder='Email address'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormControl>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={handleShowPasswordClick}>
                          {showPassword ? 'Hide' : 'Show'}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  {!showSignUp && (
                    <Button
                      bg='coveyBlue.400'
                      color='white'
                      onClick={handleLogInButton}
                      isLoading={isLoggingIn}
                      isDisabled={isLoggingIn}
                      variant='solid'
                      _hover={{ bg: 'coveyBlue.800' }}>
                      Log In
                    </Button>
                  )}
                  {showSignUp && (
                    <Button
                      bg='coveyBlue.400'
                      color='white'
                      onClick={handleSignUpButton}
                      isLoading={isSigningUp}
                      isDisabled={isSigningUp}
                      _hover={{ bg: 'coveyBlue.800' }}>
                      Sign Up
                    </Button>
                  )}
                </Stack>
              </form>
            </Box>
          </Stack>
          <Box>
            {showSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Button size='xs' colorScheme='gray' onClick={handleShowSignUp}>
              {showSignUp ? 'Log In' : 'Sign up'}
            </Button>
          </Box>
        </Flex>
      </Box>
    </>
  );
}

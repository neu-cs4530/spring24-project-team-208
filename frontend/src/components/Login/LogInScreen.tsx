import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  Stack,
  useToast,
  ToastId,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import useUserLoginController from '../../hooks/useUserLoginController';
import auth from '../../firebaseSetup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { UserController } from '../../classes/UserController';
import { ApiError } from '../../generated/client';
import { FirebaseError } from '@firebase/util';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const userLoginController = useUserLoginController();
  const { setUserController, usersService } = userLoginController;

  const handleShowPasswordClick = () => setShowPassword(!showPassword);
  const handleShowSignUp = () => setShowSignUp(!showSignUp);

  const toast = useToast();

  const handleFirebaseLogin = async (): Promise<UserController | undefined> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const newUserController: UserController = {
        username: userCredential.user.uid,
        user: userCredential.user,
      };
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

  const handleLogin = async () => {
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
      const userController = await handleFirebaseLogin();
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
      const userController = await handleFirebaseLogin();
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
        console.log(err.request);
        toast({
          title: 'Unable to sign up',
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
    if (showSignUp) {
      await handleSignUp();
    }
  };

  const handleLoginButton = async () => {
    if (!showSignUp) {
      await handleLogin();
    }
  };

  return (
    <Flex
      flexDirection='column'
      width='100wh'
      height='100vh'
      backgroundColor='blue.100'
      justifyContent='center'
      alignItems='center'>
      <Stack flexDir='column' mb='2' justifyContent='center' alignItems='center'>
        <Avatar bg='blue.500' />
        <Heading color='blue.500'>Welcome to Covey.Town!</Heading>
        <Text>{showSignUp ? 'Sign up' : 'Login'}</Text>
        <Box minW={{ base: '90%', md: '468px' }}>
          <form>
            <Stack spacing={4} p='1rem' backgroundColor='whiteAlpha.900' boxShadow='md'>
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
                  colorScheme='blue'
                  onClick={handleLoginButton}
                  isLoading={isLoggingIn}
                  isDisabled={isLoggingIn}>
                  Login
                </Button>
              )}
              {showSignUp && (
                <Button
                  colorScheme='blue'
                  onClick={handleSignUpButton}
                  isLoading={isSigningUp}
                  isDisabled={isSigningUp}>
                  Sign Up
                </Button>
              )}
            </Stack>
          </form>
        </Box>
      </Stack>
      <Box>
        Don&apos;t have an account?{' '}
        <Button size='xs' colorScheme='gray' onClick={handleShowSignUp}>
          {showSignUp ? 'Login' : 'Sign up'}
        </Button>
      </Box>
    </Flex>
  );
}

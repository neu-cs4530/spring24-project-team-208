import { Button, ToastId, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import useUserLoginController from '../../hooks/useUserLoginController';
import auth from '../../firebaseSetup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import UserController from '../../classes/UserController';
import { ApiError } from '../../generated/client';
import { FirebaseError } from '@firebase/util';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const userLoginController = useUserLoginController();
  const { setUserController, usersService } = userLoginController;

  const toast = useToast();

  const handleFirebaseLogin = async (): Promise<UserController | undefined> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const newUserController = new UserController(userCredential.user, userLoginController);
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
    if (!username || username.length === 0) {
      toast({
        title: 'Unable to log in',
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
    if (showSignUp) {
      await handleSignUp();
    } else {
      setShowSignUp(true);
    }
  };

  const handleLoginButton = async () => {
    if (!showSignUp) {
      await handleLogin();
    } else {
      setShowSignUp(false);
    }
  };

  return (
    <div>
      <h1>{showSignUp ? 'Sign Up' : 'Login'}</h1>
      <input
        type='email'
        placeholder='Email Address'
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type='text'
        placeholder='Password'
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {showSignUp && (
        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      )}
      <Button
        colorScheme={showSignUp ? 'gray' : 'blue'}
        onClick={handleLoginButton}
        isLoading={isLoggingIn}
        isDisabled={isLoggingIn}>
        Login
      </Button>
      <Button
        colorScheme={showSignUp ? 'blue' : 'gray'}
        onClick={handleSignUpButton}
        isLoading={isSigningUp}
        isDisabled={isSigningUp}>
        Sign Up
      </Button>
    </div>
  );
}

import { Button } from '@chakra-ui/react';
import React, { useState } from 'react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignUpButton = async () => {
    if (showSignUp) {
      setIsSigningUp(true);
      // TODO: Handle sign up logic here
      setIsSigningUp(false);
    } else {
      setShowSignUp(true);
    }
  };

  const handleLoginButton = async () => {
    if (!showSignUp) {
      setIsLoggingIn(true);
      // TODO: Handle login logic here
      setIsLoggingIn(false);
    } else {
      setShowSignUp(false);
    }
  };

  return (
    <div>
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

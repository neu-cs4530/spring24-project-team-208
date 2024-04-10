import { Flex } from '@chakra-ui/react';
import React from 'react';
import LeftBrandingScreen from './LogInScreenComponents/LeftBrandingScreen';
import RightLoginForm from './LogInScreenComponents/RightLoginForm';

/**
 * Renders the log in screen for the Covey.Town application.
 *
 * The log in screen allows users to log in to their account or sign up for a new account via FireBase
 * and includes branding information, such as a new logo, the Covey.Town name, and a tagline.
 */
export default function LoginScreen() {
  return (
    <Flex minH='100vh'>
      <LeftBrandingScreen />
      <RightLoginForm />
    </Flex>
  );
}

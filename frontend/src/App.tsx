import { ChakraProvider } from '@chakra-ui/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import theme from './components/VideoCall/VideoFrontend/theme';
import UserController from './classes/UserController';
import LoggedInScreen from './components/Login/LoggedInScreen';
import LogInScreen from './components/Login/LogInScreen';
import UserControllerContext from './contexts/UserControllerContext';
import UserLoginControllerContext from './contexts/UserLoginControllerContext';

function App() {
  const [userController, setUserController] = useState<UserController | null>(null);

  let page: JSX.Element;
  if (userController) {
    page = (
      <UserControllerContext.Provider value={userController}>
        <LoggedInScreen />
      </UserControllerContext.Provider>
    );
  } else {
    page = <LogInScreen />;
  }

  return (
    <UserLoginControllerContext.Provider value={{ setUserController }}>
      {page}
    </UserLoginControllerContext.Provider>
  );
}

const DEBUG_TOWN_NAME = 'DEBUG_TOWN';
function DebugApp(): JSX.Element {
  return <>{DEBUG_TOWN_NAME}</>; // TODO: Implement DebugApp
}

function AppOrDebugApp(): JSX.Element {
  const debugTown = process.env.NEXT_PUBLIC_TOWN_DEV_MODE;
  if (debugTown && debugTown.toLowerCase() === 'true') {
    return <DebugApp />;
  } else {
    return <App />;
  }
}

export default function AppStateWrapper(): JSX.Element {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <MuiThemeProvider theme={theme}>
          <AppOrDebugApp />
        </MuiThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}

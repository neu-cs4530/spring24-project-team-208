import { ChakraProvider } from '@chakra-ui/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import assert from 'assert';
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import TownController from '../../classes/TownController';
import { ChatProvider } from '../VideoCall/VideoFrontend/components/ChatProvider';
import ErrorDialog from '../VideoCall/VideoFrontend/components/ErrorDialog/ErrorDialog';
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';
import UnsupportedBrowserWarning from '../VideoCall/VideoFrontend/components/UnsupportedBrowserWarning/UnsupportedBrowserWarning';
import { VideoProvider } from '../VideoCall/VideoFrontend/components/VideoProvider';
import AppStateProvider, { useAppState } from '../VideoCall/VideoFrontend/state';
import theme from '../VideoCall/VideoFrontend/theme';
import useConnectionOptions from '../VideoCall/VideoFrontend/utils/useConnectionOptions/useConnectionOptions';
import VideoOverlay from '../VideoCall/VideoOverlay/VideoOverlay';
import TownMap from '../Town/TownMap';
import TownControllerContext from '../../contexts/TownControllerContext';
import TownLoginControllerContext from '../../contexts/TownLoginControllerContext';
import { TownsServiceClient } from '../../generated/client';
import { nanoid } from 'nanoid';
import ToggleChatButton from '../VideoCall/VideoFrontend/components/Buttons/ToggleChatButton/ToggleChatButton';

function App() {
  const [townController, setTownController] = useState<TownController | null>(null);

  const { error, setError } = useAppState();
  const connectionOptions = useConnectionOptions();
  const onDisconnect = useCallback(() => {
    townController?.disconnect();
  }, [townController]);

  let page: JSX.Element;
  if (townController) {
    page = (
      <TownControllerContext.Provider value={townController}>
        <ChatProvider>
          <TownMap />
          <VideoOverlay preferredMode='fullwidth' />
        </ChatProvider>
      </TownControllerContext.Provider>
    );
  } else {
    page = <PreJoinScreens />;
  }
  const url = process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL;
  assert(url, 'NEXT_PUBLIC_TOWNS_SERVICE_URL must be defined');
  const townsService = new TownsServiceClient({ BASE: url }).towns;
  return (
    <TownLoginControllerContext.Provider value={{ setTownController, townsService }}>
      <VideoProvider options={connectionOptions} onError={setError} onDisconnect={onDisconnect}>
        <ErrorDialog dismissError={() => setError(null)} error={error} />
        {page}
      </VideoProvider>
    </TownLoginControllerContext.Provider>
  );
}

const DEBUG_TOWN_NAME = 'DEBUG_TOWN';
function DebugApp(): JSX.Element {
  const [townController, setTownController] = useState<TownController | null>(null);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL;
    assert(url, 'NEXT_PUBLIC_TOWNS_SERVICE_URL must be defined');
    const townsService = new TownsServiceClient({ BASE: url }).towns;
    async function getOrCreateDebugTownID() {
      const towns = await townsService.listTowns();
      const existingTown = towns.find(town => town.friendlyName === DEBUG_TOWN_NAME);
      if (existingTown) {
        return existingTown.townID;
      } else {
        try {
          const newTown = await townsService.createTown({
            friendlyName: DEBUG_TOWN_NAME,
            isPubliclyListed: true,
          });
          return newTown.townID;
        } catch (e) {
          console.error(e);
          //Try one more time to see if the town had been created by another process
          const townsRetry = await townsService.listTowns();
          const existingTownRetry = townsRetry.find(town => town.friendlyName === DEBUG_TOWN_NAME);
          if (!existingTownRetry) {
            throw e;
          } else {
            return existingTownRetry.townID;
          }
        }
      }
    }
    getOrCreateDebugTownID().then(townID => {
      assert(townID);
      const newTownController = new TownController({
        townID,
        townLoginController: {
          setTownController: () => {},
          townsService,
        },
        userName: nanoid(),
      });
      newTownController.connect().then(() => {
        setTownController(newTownController);
      });
    });
  }, []);
  if (!townController) {
    return <div>Loading...</div>;
  } else {
    return (
      <TownControllerContext.Provider value={townController}>
        <ChatProvider>
          <TownMap />
          <ToggleChatButton />
        </ChatProvider>
      </TownControllerContext.Provider>
    );
  }
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
          <AppStateProvider>
            <AppOrDebugApp />
          </AppStateProvider>
        </MuiThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}

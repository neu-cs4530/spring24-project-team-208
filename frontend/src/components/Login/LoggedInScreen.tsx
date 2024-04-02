import assert from 'assert';
import React, { useCallback, useState } from 'react';
import TownController from '../../classes/TownController';
import { ChatProvider } from '../VideoCall/VideoFrontend/components/ChatProvider';
import ErrorDialog from '../VideoCall/VideoFrontend/components/ErrorDialog/ErrorDialog';
import PreJoinScreens from '../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens';
import UnsupportedBrowserWarning from '../VideoCall/VideoFrontend/components/UnsupportedBrowserWarning/UnsupportedBrowserWarning';
import { VideoProvider } from '../VideoCall/VideoFrontend/components/VideoProvider';
import AppStateProvider, { useAppState } from '../VideoCall/VideoFrontend/state';
import useConnectionOptions from '../VideoCall/VideoFrontend/utils/useConnectionOptions/useConnectionOptions';
import VideoOverlay from '../VideoCall/VideoOverlay/VideoOverlay';
import TownMap from '../Town/TownMap';
import TownControllerContext from '../../contexts/TownControllerContext';
import TownLoginControllerContext from '../../contexts/TownLoginControllerContext';
import { TownsServiceClient } from '../../generated/client';

export default function LoggedInScreen() {
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
    <AppStateProvider>
      <TownLoginControllerContext.Provider value={{ setTownController, townsService }}>
        <UnsupportedBrowserWarning>
          <VideoProvider options={connectionOptions} onError={setError} onDisconnect={onDisconnect}>
            <ErrorDialog dismissError={() => setError(null)} error={error} />
            {page}
          </VideoProvider>
        </UnsupportedBrowserWarning>
      </TownLoginControllerContext.Provider>
    </AppStateProvider>
  );
}

import { useEffect, useState } from 'react';

import { handlePreventDefault } from '../components/Form';

import { isFullscreen, requestFullscreen, exitFullscreen, isOnLine, addWindowEventListener, removeWindowEventListener } from '../utils/Global';

export const useFullscreen = () => {
    const [fullscreen, setFullscreen] = useState(isFullscreen());
    useWindowEffect('fullscreenchange', handleFullscreenChanged(setFullscreen));
    const setFullscreenOnDocument = (state) => (
        state
            ? requestFullscreen()
            : exitFullscreen()
    );
    return [fullscreen, setFullscreenOnDocument];
};

export const useOnLine = () => {
    const [onLine, setOnLine] = useState(isOnLine);
    useWindowEffect('online', handleOnLineChanged(setOnLine, true));
    useWindowEffect('offline', handleOnLineChanged(setOnLine, false));
    return onLine;
};

export const useInstallPromptEvent = () => {
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    useWindowEffect('beforeinstallprompt', handlePreventDefault(setInstallPromptEvent));
    return installPromptEvent;
}

const useWindowEffect = (type, listener) => {
    useEffect(() => {
        addWindowEventListener(type, listener);
        return () => removeWindowEventListener(type, listener);
    });
};

const handleFullscreenChanged = (setFullscreen) => () => {
    const current = isFullscreen();
    setFullscreen(current);
};

const handleOnLineChanged = (setOnLine, onLine) => () => (
    setOnLine(onLine)
);
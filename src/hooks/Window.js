import { useEffect, useState } from 'react';

import { handlePreventDefault } from '../components/Form';

import { isOnLine } from '../utils/Global';

export const useFullscreen = () => {
    const [fullscreen, setFullscreen] = useState(isFullscreen());
    useWindowEffect('fullscreenchange', handleFullscreenChanged(setFullscreen));
    const setFullscreenOnDocument = (state) => (
        state
            ? document.body.requestFullscreen()
            : document.exitFullscreen()
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
        window.addEventListener(type, listener);
        return () => window.removeEventListener(type, listener);
    });
};

const handleFullscreenChanged = (setFullscreen) => () => (
    setFullscreen(isFullscreen())
);

const handleOnLineChanged = (setOnLine, onLine) => () => (
    setOnLine(onLine)
);

const isFullscreen = () => (
    !!document.fullscreenElement
);
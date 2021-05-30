import { useEffect, useState } from 'react';

import { preventDefault } from './Form';

// Window listens to events to provide properties in a Render Prop component
export const Window = ({ render }) => {

    const [fullscreen, setFullscreen] = useState(isFullscreen());
    const fullscreenChanged = handleFullscreenChanged(setFullscreen);
    useEffect(() => {
        window.addEventListener('fullscreenchange', fullscreenChanged);
        return () => {
            window.removeEventListener('fullscreenchange', fullscreenChanged)
        };
    });

    const [onLine, setOnLine] = useState(window.navigator.onLine);
    const goOnline = handleOnLineChanged(setOnLine, true);
    const goOffline = handleOnLineChanged(setOnLine, false);
    useEffect(() => {
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    });

    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const handleInstallPrompt = preventDefault(setInstallPromptEvent);
    useEffect(() => {
        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
        };
    });

    return (
        <>
            {render({
                fullscreen: fullscreen,
                onLine: onLine,
                installPromptEvent: installPromptEvent,
            })}
        </>
    );
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
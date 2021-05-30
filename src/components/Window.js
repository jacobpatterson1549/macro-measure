import { useEffect, useState } from 'react';

import { preventDefault } from './Form';

// Window listens to events to provide properties in a Render Prop component
export const Window = ({ render }) => {
    const [fullscreen, setFullscreen] = useState(isFullscreen());
    const [onLine, setOnLine] = useState(window.navigator.onLine);
    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    const windowEvents = [
        ['fullscreenchange', handleFullscreenChanged(setFullscreen)],
        ['online', handleOnLineChanged(setOnLine, true)],
        ['offline', handleOnLineChanged(setOnLine, false)],
        ['beforeinstallprompt', preventDefault(setInstallPromptEvent)],
    ];
    useEffect(() => {
        windowEvents.forEach(([type, listener]) => (window.addEventListener(type, listener)));
        return () => (
            windowEvents.forEach(([type, listener]) => window.removeEventListener(type, listener))
        );
    });
    const props = {
        fullscreen: fullscreen,
        onLine: onLine,
        installPromptEvent: installPromptEvent,
    };
    return render(props);
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
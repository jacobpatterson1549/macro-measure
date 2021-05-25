import { useEffect, useState } from 'react';

const isFullscreen = () => !!document.fullscreenElement;

// Window listens to events to provide properties in a Render Prop component
export const Window = ({ render }) => {

    const [fullscreen, setFullscreen] = useState(isFullscreen());
    const fullscreenChanged = () => setFullscreen(isFullscreen());
    useEffect(() => {
        window.addEventListener('fullscreenchange', fullscreenChanged);
        return () => {
            window.removeEventListener('fullscreenchange', fullscreenChanged)
        };
    });

    const [onLine, setOnLine] = useState(window.navigator.onLine);
    const goOnline = () => setOnLine(true);
    const goOffline = () => setOnLine(false);
    useEffect(() => {
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    const [promptInstall, setPromptInstall] = useState(null);
    const handler = (event) => {
        event.preventDefault();
        const fn = promptInstallFn(event);
        setPromptInstall(fn);
    };
    useEffect(() => {
        window.addEventListener('beforeinstallprompt', handler);
        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    });
    const promptInstallFn = (installPromptEvent) => async () => {
        installPromptEvent.prompt();
        const choiceResult = await installPromptEvent.userChoice;
        if (choiceResult.outcome === 'accepted') {
            setPromptInstall(null);
        }
    };

    return (
        <>
            {render({
                fullscreen: fullscreen,
                onLine: onLine,
                promptInstall: promptInstall,
            })}
        </>
    );
};
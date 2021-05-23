import { useEffect, useState } from 'react';
import { ButtonInput } from './Form';

const reloadRoot = () => {
    window.location = '/';
};

export const FullscreenSettings = (
    installPromptPromise, // a promise, when defined prompts the user to install the app and resolves when the user accepts it
) => {

    const [fullScreen, setFullScreen] = useState(!!document.fullscreenElement);
    const requestFullscreen = async () => {
        await document.body.requestFullscreen();
        setFullScreen(true);
    };
    const exitFullscreen = () => {
        document.exitFullscreen();
        setFullScreen(false);
    }
    const _toggleFullscreen = (event) => (event.target.checked) ? requestFullscreen() : exitFullscreen();

    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    // TODO: move to app, pass as installPrompt as property
    useEffect(() => {
        const handler = (event) => {
            event.preventDefault();
            setInstallPromptEvent(event);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    });
    const _installPrompt = async () => {
        installPromptEvent.prompt();
        const choiceResult = await installPromptEvent.userChoice();
        if (choiceResult.outcome === 'accepted') {
            setInstallPromptEvent(null); // TODO: do if promise created by app resolves
        }
    };
    const [onLine, setOnLine] = useState(true);
    useEffect(() => {
        setOnLine(window.navigator.onLine);
    }, [setOnLine]);
    const a2hs = installPromptEvent
        ? (
            <label>
                <span>Add to Home Screen:</span>
                <ButtonInput value="Install" onClick={_installPrompt} />
            </label>
        )
        : onLine ? (
            <label>
                <span>Reload App:</span>
                <ButtonInput value="Reload" onClick={reloadRoot} />
            </label>
        )
            : (<span>Go online to reload from server to get app updates</span>);

    return (
        <fieldset>
            <legend>Fullscreen Settings</legend>
            <label>
                <span>Fullscreen:</span>
                <input type="checkbox" checked={fullScreen} onChange={_toggleFullscreen} />
            </label>
            {a2hs}
        </fieldset>
    );
}
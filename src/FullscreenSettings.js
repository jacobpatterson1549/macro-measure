import { useEffect, useState } from 'react';
import { ButtonInput } from './Form';

const reloadRoot = () => {
    window.location = '/';
};

export const FullscreenSettings = () => {

    const [fullScreen, setFullScreen] = useState(!!document.fullscreenElement);
    const requestFullscreen = () => {
        document.body.requestFullscreen()
            .then(() => setFullScreen(true));
    };
    const exitFullscreen = () => {
        document.exitFullscreen();
        setFullScreen(false);
    }
    const _toggleFullscreen = (event) => (event.target.checked) ? requestFullscreen() : exitFullscreen();

    const [installPrompt, setInstallPrompt] = useState(null);
    useEffect(() => {
        const handler = (beforeInstallPromptEvent) => {
            beforeInstallPromptEvent.preventDefault();
            setInstallPrompt(beforeInstallPromptEvent);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    });
    const [onLine, setOnLine] = useState(true);
    useEffect(() => {
        setOnLine(window.navigator.onLine);
    }, [setOnLine]);
    const a2hs = installPrompt
        ? (
            <label>
                <span>Add to Home Screen:</span>
                <ButtonInput value="Install" onClick={installPrompt.prompt} />
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
                <span>FullScreen:</span>
                <input type="checkbox" checked={fullScreen} onChange={_toggleFullscreen} />
            </label>
            {a2hs}
        </fieldset>
    );
}
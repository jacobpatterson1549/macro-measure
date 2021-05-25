import { ButtonInput } from './Form';

const reloadRoot = () => {
    window.location.assign('/');
};

export const FullscreenSettings = ({
    fullscreen, // a boolean indicating if the window is fullscreen
    onLine, // a boolean indicating if the app is online
    installPromptEvent, // an event to install the app, null if the app is installed
}) => {

    const requestFullscreen = async () => {
        await document.body.requestFullscreen();
    };
    const exitFullscreen = () => {
        document.exitFullscreen();
    }
    const _toggleFullscreen = (event) => (event.target.checked) ? requestFullscreen() : exitFullscreen();

    const _promptInstall = async () => {
        installPromptEvent.prompt();
        const choiceResult = await installPromptEvent.userChoice;
        if (choiceResult.outcome === 'accepted') {
            // force the event to be removed, as it will no longer be triggered, this will remove the button
            window.location.reload();
        }
    };
    const a2hs = installPromptEvent
        ? (
            <label>
                <span>Add to Home Screen:</span>
                <ButtonInput value="Install" onClick={_promptInstall} />
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
                <input type="checkbox" checked={fullscreen} onChange={_toggleFullscreen} />
            </label>
            {a2hs}
        </fieldset>
    );
}
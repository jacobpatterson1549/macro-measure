import { ButtonInput, CheckboxInput } from './Form';

export const FullscreenSettings = ({
    fullscreen, // a boolean indicating if the window is fullscreen
    onLine, // a boolean indicating if the app is online
    installPromptEvent, // an event to install the app, null if the app is installed
}) => (
    <fieldset>
        <legend>Fullscreen Settings</legend>
        <label>
            <span>Fullscreen:</span>
            <CheckboxInput checked={fullscreen} onChange={toggleFullscreen} />
        </label>
        {
            installPromptEvent
                ? (
                    <label>
                        <span>Add to Home Screen:</span>
                        <ButtonInput value="Install" onClick={promptInstall(installPromptEvent)} />
                    </label>
                )
                : (
                    <span>{onLine ? 'Online:' : 'OFFLINE:'} App updates after online reload.</span>
                )
        }
    </fieldset>
);

const toggleFullscreen = (toFullscreen) => (
    (toFullscreen)
        ? document.body.requestFullscreen()
        : document.exitFullscreen()
);

const promptInstall = (installPromptEvent) => async () => {
    installPromptEvent.prompt();
    const choiceResult = await installPromptEvent.userChoice;
    if (choiceResult.outcome === 'accepted') {
        // reload force the event to be removed, as it will no longer be triggered
        window.location.reload();
    }
};
import { ButtonInput, CheckboxInput } from './Form';

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
    const _toggleFullscreen = (checked) => (checked) ? requestFullscreen() : exitFullscreen();

    const _promptInstall = async () => {
        installPromptEvent.prompt();
        const choiceResult = await installPromptEvent.userChoice;
        if (choiceResult.outcome === 'accepted') {
            // reload force the event to be removed, as it will no longer be triggered
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
        : (
            <span>{onLine ? 'Online:' : 'OFFLINE:'} App updates automatically after online reload.</span>
        );

    return (
        <fieldset>
            <legend>Fullscreen Settings</legend>
            <label>
                <span>Fullscreen:</span>
                <CheckboxInput checked={fullscreen} onChange={_toggleFullscreen} />
            </label>
            {a2hs}
        </fieldset>
    );
}
import { Fieldset, ButtonInput, CheckboxInput } from './Form';

export const FullscreenSettings = ({ fullscreen, onLine, installPromptEvent }) => (
    <Fieldset caption='Fullscreen Settings'>
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
    </Fieldset>
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
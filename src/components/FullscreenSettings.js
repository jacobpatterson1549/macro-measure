import { Fieldset, Label, CheckboxInput, ButtonInput } from './Form';

export const FullscreenSettings = ({ fullscreen, onLine, installPromptEvent }) => (
    <Fieldset caption="Fullscreen Settings">
        <Label caption="Fullscreen">
            <CheckboxInput checked={fullscreen} onChange={toggleFullscreen} />
        </Label>
        {
            installPromptEvent
                ? (
                    <Label caption="Add to Home Screen">
                        <ButtonInput value="Install" onClick={promptInstall(installPromptEvent)} />
                    </Label>
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
import { Fieldset, Label, CheckboxInput, ButtonInput } from './Form';

export const FullscreenSettings = (props) => (
    <Fieldset caption="Fullscreen Settings">
        <Label caption="Fullscreen">
            <CheckboxInput checked={props.fullscreen} onChange={handleToggleFullscreen()} />
        </Label>
        {
            props.installPromptEvent
                ? (
                    <Label caption="Add to Home Screen">
                        <ButtonInput value="Install" onClick={handlePromptInstall(props.installPromptEvent)} />
                    </Label>
                )
                : (
                    <span>{props.onLine ? 'Online:' : 'OFFLINE:'} App updates after online reload.</span>
                )
        }
    </Fieldset>
);

const handleToggleFullscreen = () => (toFullscreen) => (
    (toFullscreen)
        ? document.body.requestFullscreen()
        : document.exitFullscreen()
);

const handlePromptInstall = (installPromptEvent) => async () => {
    installPromptEvent.prompt();
    const choiceResult = await installPromptEvent.userChoice;
    if (choiceResult.outcome === 'accepted') {
        // reload force the event to be removed, as it will no longer be triggered
        window.location.reload();
    }
};
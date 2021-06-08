import { Fieldset, Label, CheckboxInput, ButtonInput } from './Form';

export const FullscreenSettings = (props) => (
    <Fieldset caption="Fullscreen Settings">
        <Label caption="Fullscreen">
            <CheckboxInput
                checked={props.fullscreen}
                onChange={handleToggleFullscreen()}
            />
        </Label>
        {getAddToHomeScreen(props)}
    </Fieldset>
);

const getAddToHomeScreen = ({ installPromptEvent, onLine} ) => (
    installPromptEvent
    ? (
        <Label caption="Add to Home Screen">
            <ButtonInput
                value="Install"
                onClick={handlePromptInstall(installPromptEvent)}
            />
        </Label>
    )
    : (
        <div>
            <span>App updates when restarting after a reload.</span>
            {
                !onLine &&
                <span>Currently offline.  Go online to reload.</span>
            }
        </div>
    )
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
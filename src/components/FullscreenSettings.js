import { Fieldset, Label, CheckboxInput, ButtonInput } from './Form';

import { useFullscreen, useOnLine, useInstallPromptEvent } from '../hooks/Window';

export const FullscreenSettings = (props) => {
    const [fullscreen, setFullscreen] = useFullscreen();
    const onLine = useOnLine();
    const installPromptEvent = useInstallPromptEvent();
    return (
        <Fieldset caption="Fullscreen Settings">
            <Label caption="Fullscreen">
                <CheckboxInput
                    checked={fullscreen}
                    onChange={handleToggleFullscreen(setFullscreen)}
                />
            </Label>
            {getAddToHomeScreen(installPromptEvent, onLine)}
        </Fieldset>
    );
};

const getAddToHomeScreen = (installPromptEvent, onLine) => (
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

const handleToggleFullscreen = (setFullscreen) => (toFullscreen) => (
    setFullscreen(toFullscreen)
);

const handlePromptInstall = (installPromptEvent) => async () => {
    installPromptEvent.prompt();
    const choiceResult = await installPromptEvent.userChoice;
    if (choiceResult.outcome === 'accepted') {
        // reload force the event to be removed, as it will no longer be triggered
        window.location.reload();
    }
};
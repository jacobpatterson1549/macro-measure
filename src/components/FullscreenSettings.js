import { ButtonInput } from './Form';

const reloadRoot = () => {
    window.location = '/';
};

export const FullscreenSettings = ({
    fullscreen, // a boolean indicating if the window is fullscreen
    onLine, // a boolean indicating if the app is online
    promptInstall, // a promise to install the app, null if the app is installed
}) => {

    const requestFullscreen = async () => {
        await document.body.requestFullscreen();
    };
    const exitFullscreen = () => {
        document.exitFullscreen();
    }
    const _toggleFullscreen = (event) => (event.target.checked) ? requestFullscreen() : exitFullscreen();

    const _installPrompt = async () => await promptInstall();
    const a2hs = promptInstall
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
                <input type="checkbox" checked={fullscreen} onChange={_toggleFullscreen} />
            </label>
            {a2hs}
        </fieldset>
    );
}
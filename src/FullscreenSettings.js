import { useState } from 'react';

export const FullscreenSettings = () => {
    const [fullScreen, setFullScreen] = useState(!!document.fullscreenElement);
    const requestFullscreen = () => {
        document.body.requestFullscreen()
            .then(() => setFullScreen(true));
    };
    const exitFullscreen = () => {
        document.exitFullscreen();
        setFullScreen(false)
    }
    const _toggleFullscreen = (event) => (event.target.checked) ? requestFullscreen() : exitFullscreen();
    return (
        <fieldset>
            <legend>Fullscreen Settings</legend>
            < label >
                <span>FullScreen:</span>
                <input type="checkbox" checked={fullScreen} onChange={_toggleFullscreen} />
            </label>
        </fieldset>
    );
}
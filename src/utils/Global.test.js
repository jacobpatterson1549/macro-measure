import { isFullscreen } from './Global';

describe('Global', () => {
    const isFullscreenTests = [
        [{}, true],
        [null, false],
    ];
    it.each(isFullscreenTests)('should cast fullscreenElement of the document (%s) as a bool (%s)', (fullscreenElement, expected) => {
        window.document.fullscreenElement = fullscreenElement;
        const actual = isFullscreen();
        expect(actual).toBe(expected);
    });
});
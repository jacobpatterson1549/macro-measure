import { isFullscreen, getCurrentDate } from './Global';

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
    const getCurrentDateTests = [
        ['should have contain digits and UTC (Zulu) timezone (Z)', Date.UTC(2021, 5, 1, 17, 22, 30, 554), '20210601172230554Z'],
        ['should end in Z even if date is not in GMT', Date.parse('Tue Jun 01 2021 12:36:26 GMT-0700'), '20210601193626000Z'],
        ['show always end in Z, even for the current date', new Date().getTime(), '\\d*Z'],
    ];
    it.each(getCurrentDateTests)('%s', (name, epochMilliseconds, expected) => {
        Date.now = jest.fn().mockReturnValue(epochMilliseconds);
        const actual = getCurrentDate();
        const re = new RegExp(`^${expected}$`);
        expect(actual).toMatch(re);
    });
});
import { render, screen } from '@testing-library/react';

import { Footer } from './Footer';

import { useOnLine } from '../hooks/Window';

jest.mock('../hooks/Window', () => ({
    useOnLine: jest.fn(),
}));

describe('Footer', () => {
    const elementTests = [
        ['GPS: OFF', false, false],
        ['GPS: OFF', false, true],
        ['offline', false, false],
        ['offline', true, false],
        ['GPS: ON', true, false],
        ['GPS: ON', true, true],
        ['online', false, true],
        ['online', true, true],
    ]
    it.each(elementTests)('should have element with "%s" text when props are gpsOn=%s and onLine=%s', (expected, gpsOn, onLine) => {
        useOnLine.mockReturnValue(onLine);
        render(<Footer gpsOn={gpsOn} />);
        const element = screen.getByText((content, element) => (
            element.textContent === expected
        ));
        expect(element).toBeInTheDocument();
    })
});
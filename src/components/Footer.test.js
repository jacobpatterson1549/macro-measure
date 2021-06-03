import { render, screen } from '@testing-library/react';

import { Footer } from './Footer';

describe('Footer', () => {
    const elementTests = [
        ['GPS: OFF', {}],
        ['GPS: OFF', { gpsOn: false }],
        ['offline', {}],
        ['offline', { onLine: false }],
        ['GPS: ON', { gpsOn: true }],
        ['online', { onLine: true }],
    ]
    it.each(elementTests)('should have element with "%s" text when props are %s', (expected, props) => {
        render(<Footer { ...props } />);
        const element = screen.getByText((content, element) => element.textContent === expected);
        expect(element).toBeInTheDocument();
    })
});
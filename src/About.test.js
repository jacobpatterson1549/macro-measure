import { render, screen } from '@testing-library/react';

import { About } from './About'

describe('About', () => {
    test.each(['linkedin', 'github'])('link to %s should be in document', (link) => {
        render(<About />);
        const re = new RegExp(link, 'i');
        const linkElement = screen.getByText(re);
        expect(linkElement).toHaveAttribute('href');
    });
});
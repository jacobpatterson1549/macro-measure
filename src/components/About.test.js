import { render, screen } from '@testing-library/react';

import { About } from './About';

describe('About page', () => {
    it.each(['linkedin', 'github'])('should have %s link', (link) => {
        render(<About />);
        const re = new RegExp(link, 'i');
        const linkElement = screen.getByText(re);
        expect(linkElement).toHaveAttribute('href');
    });
});
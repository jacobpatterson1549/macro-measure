import { render, screen } from '@testing-library/react';

import { Settings } from './Settings';

describe('Settings', () => {
    const groups = [
        'GPS Settings',
        'Fullscreen Settings',
        'LocalStorage Settings',
    ];
    it.each(groups)('should have local storage settings for group %s', (group) => {
        render(<Settings />)
        const element = screen.getByRole('group', { name: group });
        expect(element).toBeInTheDocument()
    });
});
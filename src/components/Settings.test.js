import { render, screen } from '@testing-library/react';

import { Settings } from './Settings';

describe('Settings', () => {
    const groups = [
        'GPS Settings',
        'Fullscreen Settings',
        'Storage Settings',
    ];
    it.each(groups)('should have settings for group %s', (groupName) => {
        render(<Settings />)
        const element = screen.getByRole('group', { name: groupName });
        expect(element).toBeInTheDocument()
    });
});
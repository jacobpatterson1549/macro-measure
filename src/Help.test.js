import { render, screen } from '@testing-library/react';

import { Help } from './Help'

describe('Help', () => {
    test('should render', () => {
        render(<Help />);
        const helpElement = screen.getByText(/help/i);
        expect(helpElement).toBeInTheDocument();
    });
});
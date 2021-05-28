import { render, screen } from '@testing-library/react';

import { Help } from './Help';

describe('Help', () => {
    it('should be in the document', () => {
        render(<Help />);
        const helpElement = screen.getByText(/help/i);
        expect(helpElement).toBeInTheDocument();
    });
});
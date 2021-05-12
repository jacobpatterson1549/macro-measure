import { render, screen, fireEvent } from '@testing-library/react';

import { Header } from './Header';

describe('Header', () => {
    describe('each item', () => {
        const titleParts = ['groups','about','help','settings'].map(s => [s]);
        test.each(titleParts)('header should have item with title containing %s', (expected) => {
            render(<Header />);
            const re = new RegExp(expected);
            const headerElement = screen.getByTitle(re);
            expect(headerElement).toBeInTheDocument();
        });
        test.each(titleParts)('%s header element should be clickable', (expected) => {
            const handleClick = jest.fn();
            render(<Header setView={handleClick} />);
            const re = new RegExp(expected);
            const headerElement = screen.getByTitle(re);
            fireEvent.click(headerElement);
            expect(handleClick).toHaveBeenCalledWith(expected);
        });
    });
});
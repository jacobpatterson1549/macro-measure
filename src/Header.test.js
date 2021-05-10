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

    describe('groups link', () => {
        test.each`
            view             | grpName     | expected
            ${null}          | ${null}     | ${'[Groups]'}
            ${'settings'}    | ${'any'}    | ${'[Groups]'}
            ${'groups'}      | ${'ignore'} | ${'[Groups]'}
            ${'items'}       | ${'groupA'} | ${'groupA'}
            ${'item-create'} | ${'groupB'} | ${'groupB'}
            ${'item-read'}   | ${'groupC'} | ${'groupC'}
            ${'item-update'} | ${'groupD'} | ${'groupD'}
        `('text content should be $expected when view is $view and current group name is $grpName', ({ view, grpName, expected }) => {
            render(<Header view={view} currentGroupName={grpName} />);
            const groupElement = screen.getByTitle(/group/);
            expect(groupElement).toHaveTextContent(expected);
        });
        test('onClick should call setView', () => {
            const handleClick = jest.fn();
            render(<Header setView={handleClick} />);
            const groupsElement = screen.getByTitle(/group/);
            fireEvent.click(groupsElement);
            expect(handleClick).toHaveBeenCalledWith('groups');
        });
    });
});
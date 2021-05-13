import { render, screen, fireEvent } from '@testing-library/react';

import { Header } from './Header';

describe('Header', () => {
    describe('each item', () => {
        const titleParts = ['groups', 'about', 'help', 'settings'].map(s => [s]);
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
    const groupNames = [
        [null, null, '[Groups]'],
        ['settings', 'any', '[Groups]'],
        ['groups', 'ignore', '[Groups]'],
        ['items', 'groupA', 'groupA'],
        ['item-create', 'groupB', 'groupB'],
        ['item-read', 'groupC', 'groupC'],
        ['item-update', 'groupD', 'groupD'],
        ['item-delete', 'groupE', 'groupE'],
    ];
    test.each(groupNames)('when view is %s and current group name is %s, groups header text content should be %s ', (view, groupName, expected) => {
        const groups = [{ name: groupName }];
        const groupIndex = 0;
        render(<Header view={view} groups={groups} groupIndex={groupIndex} />);
        const groupElement = screen.getByTitle(/group/);
        expect(groupElement).toHaveTextContent(expected);
    });
});
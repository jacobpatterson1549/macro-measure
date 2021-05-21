import { render, screen, fireEvent } from '@testing-library/react';

import { Header } from './Header';
import { View } from './View';

describe('Header', () => {
    describe('items', () => {
        const titleParts = [
            ['groups', View.Groups_Read],
            ['about', View.About],
            ['help', View.Help],
            ['settings', View.Settings],
        ];
        test.each(titleParts)('should have item with title containing %s', (expected) => {
            render(<Header />);
            const re = new RegExp(expected);
            const headerElement = screen.getByTitle(re);
            expect(headerElement).toBeInTheDocument();
        });
        test.each(titleParts)(' should have %s header element that is clickable', (titlePart, expected) => {
            const handleClick = jest.fn();
            render(<Header setView={handleClick} />);
            const re = new RegExp(titlePart);
            const headerElement = screen.getByTitle(re);
            fireEvent.click(headerElement);
            expect(handleClick).toHaveBeenCalledWith(expected);
        });
    });
    const groupNames = [
        ['[Groups]', null, null],
        ['[Groups]', View.Settings, 'any'],
        ['[Groups]', View.Groups_Read, 'ignore'],
        ['groupA', View.Items_Read, 'groupA'],
        ['groupB', View.Item_Create, 'groupB'],
        ['groupC', View.Item_Read, 'groupC'],
        ['groupD', View.Item_Update, 'groupD'],
        ['groupE', View.Item_Delete, 'groupE'],
        ['groupF', View.Item_No_Geolocation, 'groupF'],
    ];
    test.each(groupNames)('should have groups link %s when view is %s and groupName is %s', (expected, view, groupName) => {
        const groups = [{ name: groupName }];
        const groupIndex = 0;
        render(<Header view={view} groups={groups} groupIndex={groupIndex} />);
        const groupElement = screen.getByRole('button', { name: 'groups list' });
        expect(groupElement).toHaveTextContent(expected);
    });
});
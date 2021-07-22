import { render, screen, waitFor } from '@testing-library/react';

import { NameTable } from './NameTable';

describe('NameTable', () => {
    describe('caption', () => {
        it('should include type', () => {
            const type = 'my custom type'
            render(<NameTable
                type={type}
                items={[]}
            />);
            const element = screen.getByRole('table');
            expect(element.textContent).toContain(type);
        });
    });
    describe('table', () => {
        it('should report that it is empty', () => {
            render(<NameTable
                items={[]}
            />);
            const element = screen.queryByRole('cell');
            expect(element.textContent).toMatch(/no items exist/i);
        });
        it('should not have cells if items are still being retrieved', () => {
            render(<NameTable
            />);
            const element = screen.queryByRole('cell');
            expect(element).toBeFalsy();
        });
    });
    describe('handlers', () => {
        const items = [
            { name: 'a', id: '1X' },
            { name: 'b', id: '2X' },
            { name: 'c', id: '3X' },
            { name: 'd', id: '4X' },
            { name: 'e', id: '5X' },
        ];
        const handlerTests = [
            ['read value', 'read', 0, 0, items.length],
            ['move up', 'moveUp', 1, 2, items.length - 1], // no first row to move up
            ['move down', 'moveDown', 2, 2, items.length - 1], // no last row to move down
            ['update value', 'update', 3, 3, items.length],
            ['delete value', 'deleteValue', 4, 4, items.length],
        ]
        it.each(handlerTests)('should %s at index', (elementTitle, propName, tableIndex, itemsIndex, expectedElementsLength) => {
            const handler = jest.fn();
            const reloadItems = jest.fn();
            render(<NameTable
                items={items}
                {...{ [propName]: handler }}
                reloadItems={reloadItems}
            />);
            const elements = screen.getAllByTitle(elementTitle);
            const element = elements[tableIndex];
            const expected = items[itemsIndex];
            element.click();
            expect(elements.length).toBe(expectedElementsLength);
            expect(handler).toBeCalledWith(expected);
            waitFor(expect(reloadItems).toBeCalled);
        });
    });
});
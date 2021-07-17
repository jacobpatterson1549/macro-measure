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
        it('should read element at index', async () => {
            const handler = jest.fn();
            const reloadItems = jest.fn();
            const index = 0;
            render(<NameTable
                items={items}
                read={handler}
                reloadItems={reloadItems}
            />);
            const elements = screen.getAllByTitle('read value');
            const element = elements[index];
            const expected = items[index];
            element.click();
            expect(elements.length).toBe(items.length);
            expect(handler).toBeCalledWith(expected);
            await waitFor((expect(reloadItems).toBeCalled));
        });
        it('should move row up from index', async () => {
            const handler = jest.fn();
            const reloadItems = jest.fn();
            const index = 1;
            render(<NameTable
                items={items}
                moveUp={handler}
                reloadItems={reloadItems}
            />);
            const elements = screen.getAllByTitle('move up');
            const element = elements[index];
            const expected = items[index + 1];
            element.click();
            expect(elements.length).toBe(items.length - 1); // no first move up
            expect(handler).toBeCalledWith(expected);
            await waitFor((expect(reloadItems).toBeCalled));
        });
        it('should move row down from index', async () => {
            const handler = jest.fn();
            const reloadItems = jest.fn();
            const index = 2;
            render(<NameTable
                items={items}
                moveDown={handler}
                reloadItems={reloadItems}
            />);
            const elements = screen.getAllByTitle('move down');
            const element = elements[index];
            const expected = items[index];
            element.click();
            expect(elements.length).toBe(items.length - 1); // no last move down
            expect(handler).toBeCalledWith(expected);
            await waitFor((expect(reloadItems).toBeCalled));
        });
        it('should update name of row at index', async () => {
            const handler = jest.fn();
            const reloadItems = jest.fn();
            const index = 3;
            render(<NameTable
                items={items}
                update={handler}
                reloadItems={reloadItems}
            />);
            const elements = screen.getAllByTitle('update value');
            const element = elements[index];
            const expected = items[index];
            element.click();
            expect(elements.length).toBe(items.length);
            expect(handler).toBeCalledWith(expected);
            await waitFor((expect(reloadItems).toBeCalled));
        });
        it('should delete row at index', async () => {
            const handler = jest.fn();
            const reloadItems = jest.fn();
            const index = 4;
            render(<NameTable
                items={items}
                deleteValue={handler}
                reloadItems={reloadItems}
            />);
            const elements = screen.getAllByTitle('delete value');
            const element = elements[index];
            const expected = items[index];
            element.click();
            expect(elements.length).toBe(items.length);
            expect(handler).toBeCalledWith(expected);
            await waitFor((expect(reloadItems).toBeCalled));
        });
    });
});
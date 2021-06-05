import { render, screen } from '@testing-library/react';

import { NameTable } from './NameTable';

describe('NameTable', () => {
    describe('caption', () => {
        it('should include type', () => {
            const type = 'my custom type'
            render(<NameTable type={type} values={[]} />);
            const element = screen.getByRole('table');
            expect(element.textContent).toContain(type);
        });
    });
    describe('table', () => {
        it('should report that it is empty', () => {
            render(<NameTable values={[]} />);
            const element = screen.getByRole('cell');
            expect(element.textContent).toMatch(/no values exist/i);
        });
        it('should report that it is empty when there are no values', () => {
            render(<NameTable />);
            const element = screen.getByRole('cell');
            expect(element.textContent).toMatch(/no values exist/i);
        });
    });
    describe('handlers', () => {
        const values = [
            { name: 'a' },
            { name: 'b' },
            { name: 'c' },
            { name: 'd' },
            { name: 'e' },
        ];
        it('should read element at index', () => {
            const handler = jest.fn();
            const index = 0;
            render(<NameTable values={values} read={handler} />);
            const elements = screen.getAllByTitle('read value');
            const element = elements[index];
            element.click();
            expect(elements.length).toBe(values.length);
            expect(handler).toBeCalledWith(index);
        });
        it('should move row up from index', () => {
            const handler = jest.fn();
            const index = 1;
            render(<NameTable values={values} moveUp={handler} />);
            const elements = screen.getAllByTitle('move up');
            const element = elements[index];
            element.click();
            expect(elements.length).toBe(values.length - 1); // no first move up
            expect(handler).toBeCalledWith(index + 1); // the first row das no move up button
        });
        it('should move row down from index', () => {
            const handler = jest.fn();
            const index = 2;
            render(<NameTable values={values} moveDown={handler} />);
            const elements = screen.getAllByTitle('move down');
            const element = elements[index];
            element.click();
            expect(elements.length).toBe(values.length - 1); // no last move down
            expect(handler).toBeCalledWith(index);
        });
        it('should update name of row at index', () => {
            const handler = jest.fn();
            const index = 3;
            render(<NameTable values={values} update={handler} />);
            const elements = screen.getAllByTitle('update value');
            const element = elements[index];
            element.click();
            expect(elements.length).toBe(values.length);
            expect(handler).toBeCalledWith(index);
        });
        it('should delete row at index', () => {
            const handler = jest.fn();
            const index = 4;
            render(<NameTable values={values} deleteValue={handler} />);
            const elements = screen.getAllByTitle('delete value');
            const element = elements[index];
            element.click();
            expect(elements.length).toBe(values.length);
            expect(handler).toBeCalledWith(index);
        });
    });
});
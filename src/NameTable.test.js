import { render, screen, fireEvent } from '@testing-library/react';

import { NameTable } from './NameTable';



test('caption', () => {
    const type = 'my custom type'
    render(<NameTable type={type} values={[]} />);
    const element = document.querySelector('caption');
    expect(element.textContent).toContain(type);
});

test('no values', () => {
    render(<NameTable values={[]} />);
    const element = document.querySelector('td');
    expect(element.textContent).toMatch(/no values exist/i);
});

describe('handlers', () => {
    const values = [
        { name: 'a' },
        { name: 'b' },
        { name: 'c' },
        { name: 'd' },
        { name: 'e' },
    ];
    test('create', () => {
        const handler = jest.fn();
        const index = 0;
        render(<NameTable values={values} read={handler} />);
        const elements = screen.getAllByTitle(/select/);
        const element = elements[index];
        fireEvent.click(element);
        expect(elements.length).toBe(values.length);
    });
    test('move up', () => {
        const handler = jest.fn();
        const index = 1;
        render(<NameTable values={values} moveUp={handler} />);
        const elements = screen.getAllByTitle(/move up/);
        const element = elements[index];
        fireEvent.click(element);
        expect(elements.length).toBe(values.length-1); // no first move up
        expect(handler).toBeCalledWith(index + 1); // the first row das no move up button
    });
    test('move down', () => {
        const handler = jest.fn();
        const index = 2;
        render(<NameTable values={values} moveDown={handler} />);
        const elements = screen.getAllByTitle(/move down/);
        const element = elements[index];
        fireEvent.click(element);
        expect(elements.length).toBe(values.length-1); // no last move down
        expect(handler).toBeCalledWith(index);
    });
    test('update', () => {
        const handler = jest.fn();
        const index = 3;
        render(<NameTable values={values} update={handler} />);
        const elements = screen.getAllByTitle(/edit/);
        const element = elements[index];
        fireEvent.click(element);
        expect(elements.length).toBe(values.length);
        expect(handler).toBeCalledWith(index);
    });
    test('delete', () => {
        const handler = jest.fn();
        const index = 4;
        render(<NameTable values={values} deleteValue={handler} />);
        const elements = screen.getAllByTitle(/delete/);
        const element = elements[index];
        fireEvent.click(element);
        expect(elements.length).toBe(values.length);
        expect(handler).toBeCalledWith(index);
    });
});
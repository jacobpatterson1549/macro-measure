import { render, screen, fireEvent } from '@testing-library/react';

import { NameList } from './NameList';

describe('View', () => {
    const viewTests = [
        ['Create', 'test-create'],
        ['Update', 'test-update'],
        ['Delete', 'test-delete'],
        ['Create', 'test-read'],
    ];
    test.each(viewTests)('should have %s button when view is %s', (expected, view) => {
        render(<NameList
            type={'test'}
            view={view}
            values={[{ name: 'a' }]}
            index={0}
        />);
        const element = document.querySelector('input[type="submit"]');
        expect(element.value).toContain(expected);
    });
});

describe('handlers', () => {
    const values = [{ name: 'a' }, { name: 'b'}, {name: 'c' }];
    describe('start', () => {
        test('create', () => {
            const createStart = jest.fn();
            render(<NameList type={'test'} view={'test-read'} values={values} index={1} createStart={createStart} />);
            const element = document.querySelector('input[type="submit"]');
            fireEvent.submit(element);
            expect(createStart).toBeCalled();
        });
        test('update', () => {
            const updateStart = jest.fn();
            render(<NameList type={'test'} view={'test-read'} values={values} index={1} updateStart={updateStart} />);
            const element = screen.getAllByTitle(/edit/i)[1];
            fireEvent.click(element);
            expect(updateStart).toBeCalled();
        });
        test('delete', () => {
            const deleteStart = jest.fn();
            render(<NameList type={'test'} view={'test-read'} values={values} index={1} deleteStart={deleteStart} />);
            const element = screen.getAllByTitle(/delete/i)[1];
            fireEvent.click(element);
            expect(deleteStart).toBeCalled();
        });
    });
    describe('end', () => {
        test('create', () => {
            const createEnd = jest.fn();
            render(<NameList type={'test'} view={'test-create'} values={values} index={1} createEnd={createEnd} />);
            const element = document.querySelector('input[type="submit"]');
            fireEvent.submit(element);
            expect(createEnd).toBeCalled();
        });
        test('update', () => {
            const updateEnd = jest.fn();
            render(<NameList type={'test'} view={'test-update'} values={values} index={1} updateEnd={updateEnd} />);
            const element = document.querySelector('input[type="submit"]');
            fireEvent.submit(element);
            expect(updateEnd).toBeCalledWith(1, expect.anything())
        });
        test('delete', () => {
            const deleteEnd = jest.fn();
            render(<NameList type={'test'} view={'test-delete'} values={values} index={2} deleteEnd={deleteEnd} />);
            const element = document.querySelector('input[type="submit"]');
            fireEvent.submit(element);
            expect(deleteEnd).toBeCalledWith(2);
        });
    });
});
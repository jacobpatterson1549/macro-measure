import { render, screen, fireEvent } from '@testing-library/react';

import { NameList } from './NameList';

describe('View', () => {
    const viewTests = [
        ['Create', 'test-create'],
        ['Update', 'test-update'],
        ['Delete', 'test-delete'],
        ['Create', 'test-read'],
    ];
    test.each(viewTests)('should have only button of %s when view is %s', (expected, view) => {
        render(<NameList
            type={'test'}
            view={view}
            values={[{ name: 'a' }]}
            index={0}
        />);
        const elements = document.querySelectorAll('input[type="submit"]');
        expect(elements.length).toBe(1);
        const element = elements[0];
        expect(element.value).toContain(expected);
    });
});

describe('handlers', () => {
    const values = [{ name: 'a' }, { name: 'b'}, {name: 'c' }];
    describe('start', () => {
        it('should start creating when the create button is clicked', () => {
            const createStart = jest.fn();
            render(<NameList type={'test'} view={'test-read'} values={values} index={1} createStart={createStart} />);
            const element = document.querySelector('input[type="submit"]');
            fireEvent.click(element);
            expect(createStart).toBeCalled();
            expect(localStorage.setItem.mock.calls[1][1]).toMatch(/new/i);
        });
        it('should start updating when the edit button is clicked', () => {
            const updateStart = jest.fn();
            render(<NameList type={'test'} view={'test-read'} values={values} index={1} updateStart={updateStart} />);
            const element = screen.getAllByTitle(/edit/i)[1];
            fireEvent.click(element);
            expect(updateStart).toBeCalled();
            expect(localStorage.setItem.mock.calls[1][1]).toBe('"b"');
        });
        it('should start deleting when the delete button is clicked', () => {
            const deleteStart = jest.fn();
            render(<NameList type={'test'} view={'test-read'} values={values} index={1} deleteStart={deleteStart} />);
            const element = screen.getAllByTitle(/delete/)[2];
            fireEvent.click(element);
            expect(deleteStart).toBeCalled();
            expect(localStorage.setItem.mock.calls[1][1]).toBe('"c"');
        });
    });
    describe('finish', () => {
        it('should finish creating when the form is submitted', () => {
            const createEnd = jest.fn();
            render(<NameList type={'test'} view={'test-create'} values={values} index={1} createEnd={createEnd} />);
            const element = document.querySelector('input[type="submit"]');
            fireEvent.submit(element);
            expect(createEnd).toBeCalled();
        });
        it('should finish updating when the form is submitted', () => {
            const updateEnd = jest.fn();
            render(<NameList type={'test'} view={'test-update'} values={values} index={1} updateEnd={updateEnd} />);
            const element = document.querySelector('input[type="submit"]');
            fireEvent.submit(element);
            expect(updateEnd).toBeCalledWith(1, expect.anything())
        });
        it('should finish deleting when the form is submitted', () => {
            const deleteEnd = jest.fn();
            render(<NameList type={'test'} view={'test-delete'} values={values} index={2} deleteEnd={deleteEnd} />);
            const element = document.querySelector('input[type="submit"]');
            fireEvent.submit(element);
            expect(deleteEnd).toBeCalledWith(2);
        });
    });
});
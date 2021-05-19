import { render, screen, fireEvent } from '@testing-library/react';

import { Form, SubmitInput, Input, NameInput } from './Input';

describe('Input', () => {
    test("type", () => {
        render(<Input type="text" onChange={() => { }} />);
        const element = screen.getByRole('textbox');
        expect(element.type).toBe('text');
    });
    test("value", () => {
        render(<Input value="test2" onChange={() => { }} />);
        const element = screen.getByRole('textbox');
        expect(element.value).toBe('test2');
    });
    test("min/max", () => {
        render(<Input min={7} max={9} onChange={() => { }} />);
        const element = screen.getByRole('textbox');
        expect(element).toBeInTheDocument();
        expect(element.min).toBe("7");
        expect(element.max).toBe("9");
    });
    test("onChange", () => {
        let value = 'before';
        render(<Input value={value} onChange={(event) => { value = event.target.value }} />);
        const element = screen.getByRole('textbox');
        fireEvent.change(element, { target: { value: 'after' } });
        expect(value).toBe('after');
    });
    test("onFocus", () => {
        const selectFn = jest.fn();
        render(<Input onChange={() => { }} />);
        const element = screen.getByRole('textbox');
        fireEvent.focus(element, { target: { select: selectFn } });
        expect(selectFn).toBeCalled();
    });
});

describe('NameInput', () => {
    test('type', () => {
        render(<NameInput type="text" onChange={() => { }} />);
        const element = screen.getByRole('textbox');
        expect(element.type).toBe('text');
    });
    test('value', () => {
        render(<NameInput value="test2" onChange={() => { }} />);
        const element = screen.getByRole('textbox');
        expect(element.value).toBe('test2');
    });
    test('min/max should not flow through', () => {
        render(<NameInput min={7} max={9} onChange={() => { }} />);
        const element = screen.getByRole('textbox');
        expect(element).toBeInTheDocument();
        expect(element.min).toBe('');
        expect(element.max).toBe('');
    });
    test("onChange", () => {
        const values = [];
        let value = 'before';
        render(<NameInput values={values} value={value} onChange={(name) => { value = name }} />);
        const element = screen.getByRole('textbox');
        fireEvent.change(element, { target: { value: 'after' } });
        expect(value).toBe('after');
    });
    test('onFocus', () => {
        const selectFn = jest.fn();
        render(<NameInput onChange={() => { }} />);
        const element = screen.getByRole('textbox');
        fireEvent.focus(element, { target: { select: selectFn } });
        expect(selectFn).toBeCalled();
    });
    const uniqueNameTests = [
        [[{ name: 'a' }, { name: 'c' }], -1, 'b', true],
        [[{ name: 'a' }, { name: 'c' }], -1, 'c', false],
        [[{ name: 'a' }, { name: 'c' }], 1, 'c', true],
    ];
    test.each(uniqueNameTests)('when values are %s, expect updating value at index %s with name of %s to be valid: %s', (values, updateIndex, name, expectedValid) => {
        const setCustomValidityFn = jest.fn();
        const expectedMatcher = expectedValid ? '' : expect.stringMatching(/./);
        let value = 'before';
        render(<NameInput values={values} value={value} updateIndex={updateIndex} onChange={(name2) => { value = name2 }} />);
        const element = screen.getByRole('textbox');
        fireEvent.change(element, { target: { value: name, setCustomValidity: setCustomValidityFn } });
        expect(value).toBe(name);
        expect(setCustomValidityFn).toHaveBeenCalledWith(expectedMatcher);
    });
});

describe('SubmitInput', () => {
    test('value', () => {
        const expected = 'test3';
        render(<SubmitInput value={expected} />);
        const element = screen.getByRole('button');
        expect(element.value).toBe(expected);
    });
    test('default value', () => {
        const expected = 'Submit';
        render(<SubmitInput />);
        const element = screen.getByRole('button');
        expect(element.value).toBe(expected);
    });
    test('disabled', () => {
        const expected = true;
        render(<SubmitInput disabled={expected} />);
        const element = screen.getByRole('button');
        expect(element.disabled).toBe(expected);
    });
});

describe('Form', () => {
    test('onSubmit', () => {
        const onSubmit = jest.fn();
        render(<Form onSubmit={onSubmit}><SubmitInput /></Form>);
        const element = screen.getByRole('button');
        fireEvent.submit(element);
        expect(onSubmit).toBeCalled();
    });
    test('preventDefault', () => {
        const preventDefault = jest.fn();
        const onSubmit = jest.fn();
        render(<Form onSubmit={onSubmit}><SubmitInput /></Form>);
        const element = screen.getByRole('button');
        fireEvent.submit(element, { preventDefault: preventDefault });
        expect(onSubmit).toBeCalled();
    });
    test('children', () => {
        render(
            <Form>
                <label>a<Input /></label>
                <label>b<Input /></label>
                <label>c<Input /></label>
                <SubmitInput />
            </Form>
        );
        expect(screen.getByLabelText('a')).toBeInTheDocument();
        expect(screen.getByLabelText('b')).toBeInTheDocument();
        expect(screen.getByLabelText('c')).toBeInTheDocument();
    });
});
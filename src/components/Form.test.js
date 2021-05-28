import { render, screen, fireEvent, createEvent } from '@testing-library/react';

import { Form, SubmitInput, Input, TextInput, NumberInput, NameInput, ButtonInput, CheckboxInput, FileInput } from './Form';

describe('TextInput', () => {
    it('should have text type', () => {
        render(<TextInput />);
        const element = screen.getByRole('textbox');
        expect(element.type).toBe('text');
    });
    it('should have value', () => {
        const expected = 'test1';
        render(<TextInput value={expected} />);
        const element = screen.getByRole('textbox');
        expect(element.value).toBe(expected);
    });
    it('should call onChange when changed', () => {
        const expected = '[some changed value]';
        const onChange = jest.fn();
        render(<TextInput onChange={onChange} />);
        const element = screen.getByRole('textbox');
        fireEvent.change(element, { target: { value: expected } });
        expect(onChange).toBeCalledWith(expected);
    });
    it('should select when focused', () => {
        const selectFn = jest.fn();
        render(<TextInput />);
        const element = screen.getByRole('textbox');
        fireEvent.focus(element, { target: { select: selectFn } });
        expect(selectFn).toBeCalled();
    });
    it('should be required', () => {
        render(<TextInput />);
        const element = screen.getByRole('textbox');
        expect(element).toHaveAttribute('required');
    });
    it('should not be disabled when not specified', () => {
        render(<TextInput />);
        const element = screen.getByRole('textbox');
        expect(element.disabled).toBeFalsy()
    });
    it('should be disabled when true', () => {
        render(<TextInput disabled={true} />);
        const element = screen.getByRole('textbox');
        expect(element.disabled).toBeTruthy()
    });
});

describe('NumberInput', () => {
    it('should have number type', () => {
        render(<NumberInput />);
        const element = screen.getByRole('spinbutton');
        expect(element.type).toBe('number');
    });
    it('should have value', () => {
        const expected = '69';
        render(<NumberInput value={expected} />);
        const element = screen.getByRole('spinbutton');
        expect(element.value).toBe(expected);
    });
    it('should set min', () => {
        render(<NumberInput min={7} max={9} />);
        const element = screen.getByRole('spinbutton');
        expect(element.min).toBe("7");
    });
    it('should set min', () => {
        render(<NumberInput min={7} max={9} />);
        const element = screen.getByRole('spinbutton');
        expect(element.max).toBe("9");
    });
    it('should call onChange when changed', () => {
        const expected = '7';
        const onChange = jest.fn();
        render(<NumberInput onChange={onChange} />);
        const element = screen.getByRole('spinbutton');
        fireEvent.change(element, { target: { value: expected } });
        expect(onChange).toBeCalledWith(expected);
    });
    it('should NOT call onChange when changed to invalid number', () => {
        const onChange = jest.fn();
        render(<NumberInput onChange={onChange} />);
        const element = screen.getByRole('spinbutton');
        fireEvent.change(element, { target: { value: 'INVALID NUMBER' } });
        expect(onChange).not.toBeCalled();
    });
    it('should select when focused', () => {
        const selectFn = jest.fn();
        render(<NumberInput />);
        const element = screen.getByRole('spinbutton');
        fireEvent.focus(element, { target: { select: selectFn } });
        expect(selectFn).toBeCalled();
    });
    it('should be required', () => {
        render(<NumberInput />);
        const element = screen.getByRole('spinbutton');
        expect(element).toHaveAttribute('required');
    });
});

describe('NameInput', () => {
    it('should always have text type', () => {
        render(<NameInput />);
        const element = screen.getByRole('textbox');
        expect(element.type).toBe('text');
    });
    it('should have value', () => {
        const expected = 'test2';
        render(<NameInput value={expected} />);
        const element = screen.getByRole('textbox');
        expect(element.value).toBe(expected);
    });
    it('should not set min/max', () => {
        render(<NameInput min={7} max={9} />);
        const element = screen.getByRole('textbox');
        expect(element).toBeInTheDocument();
        expect(element.min).toBe('');
        expect(element.max).toBe('');
    });
    it('should change value when changed', () => {
        const value = 'before';
        const expected = 'after';
        const values = [];
        const onChange = jest.fn()
        render(<NameInput value={value} values={values} onChange={onChange} />);
        const element = screen.getByRole('textbox');
        fireEvent.change(element, { target: { value: expected } });
        expect(onChange).toBeCalledWith(expected)
    });
    it('should select when focused', () => {
        const selectFn = jest.fn();
        render(<NameInput />);
        const element = screen.getByRole('textbox');
        fireEvent.focus(element, { target: { select: selectFn } });
        expect(selectFn).toBeCalled();
    });
    const uniqueNameTests = [
        [true, [{ name: 'a' }, { name: 'c' }], -1, 'b'],
        [false, [{ name: 'a' }, { name: 'c' }], -1, 'c'],
        [true, [{ name: 'a' }, { name: 'c' }], 1, 'c'],
    ];
    it.each(uniqueNameTests)('should have valid = %s when values are %s, the update index is %d, and the new name is %s', (expectedValid, values, updateIndex, name) => {
        const setCustomValidity = jest.fn();
        const onChange = jest.fn();
        const expectedMatcher = expectedValid ? '' : expect.stringMatching(/./);
        render(<NameInput values={values} updateIndex={updateIndex} onChange={onChange} />);
        const element = screen.getByRole('textbox');
        fireEvent.change(element, { target: { value: name, setCustomValidity: setCustomValidity } });
        expect(setCustomValidity).toHaveBeenCalledWith(expectedMatcher);
    });
    it('should be required', () => {
        render(<NameInput />);
        const element = screen.getByRole('textbox');
        expect(element).toHaveAttribute('required');
    });
});

describe('ButtonInput', () => {
    it('should have button type', () => {
        render(<ButtonInput />);
        const element = screen.getByRole('button');
        expect(element.type).toBe('button');
    });
    it('should have value', () => {
        const expected = 'test4';
        render(<ButtonInput value={expected} />);
        const element = screen.getByRole('button');
        expect(element.value).toBe(expected);
    });
    it('should call onChange when clicked', () => {
        const onClick = jest.fn();
        render(<ButtonInput onClick={onClick} />);
        const element = screen.getByRole('button');
        fireEvent.click(element);
        expect(onClick).toBeCalled();
    });
    it('should preventDefault when clicked', () => {
        const onClick = jest.fn();
        render(<ButtonInput onClick={onClick} />);
        const element = screen.getByRole('button');
        const event = createEvent.click(element);
        fireEvent(element, event);
        expect(event.defaultPrevented).toBeTruthy();
    });
    it.each([true, false])('should set disabled when disabled=%s', (disabled) => {
        render(<ButtonInput disabled={disabled} />);
        const element = screen.getByRole('button');
        expect(element.disabled).toBe(disabled);
    });
});

describe('CheckboxInput', () => {
    it('should have checkbox type', () => {
        render(<CheckboxInput />);
        const element = screen.getByRole('checkbox');
        expect(element.type).toBe('checkbox');
    });
    it.each([true, false])('should handle checked=%s', (expected) => {
        render(<CheckboxInput checked={expected} />);
        const element = screen.getByRole('checkbox');
        expect(element.checked).toBe(expected);
    });
    it.each([[true, false], [false, true]])('should call onChange with %s when checked=%s and changed', (expected, checked) => {
        const onChange = jest.fn();
        render(<CheckboxInput checked={checked} onChange={onChange} />);
        const element = screen.getByRole('checkbox');
        element.click();
        expect(onChange).toBeCalledWith(expected);
    });
});

describe('FileInput', () => {
    it('should have file type', () => {
        render(<FileInput />);
        const element = screen.getByRole('button');
        expect(element.type).toBe('file');
    });
    it('should set accept', () => {
        const expected = "[mock MIME type]";
        render(<FileInput accept={expected} />);
        const element = screen.getByRole('button');
        expect(element.accept).toBe(expected);
    });
    it('should call onChange with first file when changed', () => {
        const expected = 'file A';
        const onChange = jest.fn();
        render(<FileInput onChange={onChange} />);
        const element = screen.getByRole('button');
        fireEvent.change(element, { target: { files: [expected] } });
        expect(onChange).toBeCalledWith(expected);
    });
});

describe('SubmitInput', () => {
    it('should have submit type', () => {
        render(<SubmitInput />);
        const element = screen.getByRole('button');
        expect(element.type).toBe('submit');
    });
    it('should have value', () => {
        const expected = 'test3';
        render(<SubmitInput value={expected} />);
        const element = screen.getByRole('button');
        expect(element.value).toBe(expected);
    });
    it('should have default value', () => {
        const expected = 'Submit';
        render(<SubmitInput />);
        const element = screen.getByRole('button');
        expect(element.value).toBe(expected);
    });
});

describe('Form', () => {
    it('should call onSubmit when submitted', () => {
        const onSubmit = jest.fn();
        render(<Form onSubmit={onSubmit}><SubmitInput /></Form>);
        const element = screen.getByRole('button');
        fireEvent.submit(element);
        expect(onSubmit).toBeCalled();
    });
    it('should preventDefault when submitted', () => {
        const onSubmit = jest.fn();
        render(<Form onSubmit={onSubmit}><SubmitInput /></Form>);
        const element = screen.getByRole('button');
        const event = createEvent.submit(element);
        fireEvent(element, event);
        expect(event.defaultPrevented).toBeTruthy();
    });
    it('should preserve children', () => {
        render(
            <Form>
                <label>a<TextInput /></label>
                <label>b<TextInput /></label>
                <label>c<TextInput /></label>
                <SubmitInput />
            </Form>
        );
        expect(screen.getByLabelText('a')).toBeInTheDocument();
        expect(screen.getByLabelText('b')).toBeInTheDocument();
        expect(screen.getByLabelText('c')).toBeInTheDocument();
    });
});
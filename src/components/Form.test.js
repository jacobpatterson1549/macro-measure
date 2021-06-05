import { render, screen, fireEvent, createEvent } from '@testing-library/react';

import { Form, TextInput, NumberInput, NameInput, ButtonInput, CheckboxInput, FileInput, SelectInput, preventDefault, Fieldset, Label } from './Form';

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
    it('should set max', () => {
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
        [true, [{ name: 'a' }, { name: 'c' }], -1, 'b', ''],
        [false, [{ name: 'a' }, { name: 'c' }], -1, 'c', expect.stringMatching(/./)],
        [true, [{ name: 'a' }, { name: 'c' }], 1, 'c', ''],
    ];
    it.each(uniqueNameTests)('should have valid = %s when values are %s, the update index is %d, and the new name is %s', (expectedValid, values, updateIndex, name, expected) => {
        const setCustomValidity = jest.fn();
        const onChange = jest.fn();
        render(<NameInput values={values} updateIndex={updateIndex} onChange={onChange} />);
        const element = screen.getByRole('textbox');
        fireEvent.change(element, { target: { value: name, setCustomValidity: setCustomValidity } });
        expect(setCustomValidity).toHaveBeenCalledWith(expected);
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
        fireEvent.click(element)
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

describe('SelectInput', () => {
    it('should have value', () => {
        const expected = 'test5';
        render(<SelectInput value={expected} values={['test5']} />);
        const element = screen.getByRole('combobox');
        expect(element.value).toBe(expected);
    });
    it('should have value when multiple exist', () => {
        const expected = 'test5b';
        render(<SelectInput value={expected} values={['test5a', 'test5b', 'test5c']} />);
        const element = screen.getByRole('combobox');
        expect(element.value).toBe(expected);
    });
    it('should have first value when multiple exist and initial value is not in values', () => {
        const value = 'test5d';
        const expected = 'test5a';
        render(<SelectInput value={value} values={['test5a', 'test5b', 'test5c']} />);
        const element = screen.getByRole('combobox');
        expect(element.value).toBe(expected);
    });
    it('should call onChange', () => {
        const value = 'test5a';
        const expected = 'test5b';
        const onChange = jest.fn();
        render(<SelectInput value={value} values={['test5a', 'test5b', 'test5c']} onChange={onChange} />);
        const element = screen.getByRole('combobox');
        fireEvent.change(element, { target: { value: expected } });
        expect(onChange).toBeCalledWith(expected);
    });
})

describe('Label', () => {
    it('should have caption', () => {
        const expected = '[some caption]';
        render(<Label caption={expected} />);
        const element = screen.getByText(expected);
        expect(element).toBeInTheDocument();
    });
    it('should have children', () => {
        const expected = '[some caption]';
        render(
            <Label caption={expected}>
                <div>A</div>
                <div>B</div>
                <div>C</div>
            </Label>
        );
        const element = screen.getByText(expected);
        expect(element.parentElement.childElementCount).toBe(4);
    });
});

describe('Fieldset', () => {
    it('should NOT have legend', () => {
        render(<Fieldset />);
        const element = screen.getByRole('group');
        expect(element.childElementCount).toBe(0);
    });
    it('should have legend', () => {
        const expected = '[some legend]';
        render(<Fieldset caption={expected} />);
        const element = screen.getByRole('group', { name: expected });
        expect(element).toBeInTheDocument();
    });
    it('should NOT be disabled', () => {
        render(<Fieldset />);
        const element = screen.getByRole('group');
        expect(element.disabled).toBeFalsy();
    });
    it('should be disabled', () => {
        render(<Fieldset disabled={true} />);
        const element = screen.getByRole('group');
        expect(element.disabled).toBeTruthy();
    });
    it('should have children', () => {
        render(
            <Fieldset>
                <Label caption="A" />
                <Label caption="B" />
                <Label caption="C" />
            </Fieldset>
        );
        const element = screen.getByRole('group');
        expect(element.childElementCount).toBe(3);
    });
    it('should have a default border', () => {
        render(<Fieldset />);
        const element = screen.getByRole('group');
        expect(element.classList.contains('NoBorder')).toBeFalsy();
    });
    it('should NOT have a border', () => {
        render(<Fieldset border={false} />);
        const element = screen.getByRole('group');
        expect(element.classList.contains('NoBorder')).toBeTruthy();
    });
});

describe('Form', () => {
    it('should call onSubmit when submitted', () => {
        const onSubmit = jest.fn();
        render(<Form onSubmit={onSubmit} />);
        const element = screen.getByRole('button');
        fireEvent.submit(element);
        expect(onSubmit).toBeCalled();
    });
    it('should preventDefault when submitted', () => {
        const onSubmit = jest.fn();
        render(<Form onSubmit={onSubmit}></Form>);
        const element = screen.getByRole('button');
        const event = createEvent.submit(element);
        fireEvent(element, event);
        expect(event.defaultPrevented).toBeTruthy();
    });
    it('should preserve children', () => {
        render(
            <Form>
                <Label caption="a"><input /></Label>
                <Label caption="b"><input /></Label>
                <Label caption="c"><input /></Label>
            </Form>
        );
        expect(screen.getByLabelText('a')).toBeInTheDocument();
        expect(screen.getByLabelText('b')).toBeInTheDocument();
        expect(screen.getByLabelText('c')).toBeInTheDocument();
    });
    it('should have submit type', () => {
        render(<Form />);
        const element = screen.getByRole('button');
        expect(element.type).toBe('submit');
    });
    it('should have submit value', () => {
        const expected = 'test3';
        render(<Form submitValue={expected} />);
        const element = screen.getByRole('button');
        expect(element.value).toBe(expected);
    });
    it('should have default value', () => {
        const expected = 'Submit';
        render(<Form />);
        const element = screen.getByRole('button');
        expect(element.value).toBe(expected);
    });
    it('should not have disabled submit button', () => {
        render(<Form />);
        const element = screen.getByRole('button');
        expect(element.disabled).toBeFalsy();
    });
    it('should have disable submit button', () => {
        render(<Form submitDisabled={true} />);
        const element = screen.getByRole('button');
        expect(element.disabled).toBeTruthy();
    });
    it('should have two buttons', () => {
        const onCancel = jest.fn();
        render(<Form onCancel={onCancel} />);
        const elements = screen.getAllByRole('button');
        expect(elements.length).toBe(2);
    });
    it('should call onCancel', () => {
        const onCancel = jest.fn();
        render(<Form onCancel={onCancel} />);
        const element = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(element)
        expect(onCancel).toBeCalled();
    });
    it('should NOT disable cancel button when submit button is', () => {
        const onCancel = jest.fn();
        render(<Form submitDisabled={true} onCancel={onCancel} />);
        expect(screen.getByRole('button', { name: 'Cancel' }).disabled).toBeFalsy();
        expect(screen.getByRole('button', { name: 'Submit' }).disabled).toBeTruthy();
    });
});

describe('preventDefault', () => {
    it('should call preventDefault', () => {
        const event = { preventDefault: jest.fn() }
        preventDefault()(event);
        expect(event.preventDefault).toBeCalled();
        // should not crash if callback not provided
    });
    it('should call fn with event', () => {
        const callback = jest.fn();
        const event = { preventDefault: jest.fn() }
        preventDefault(callback)(event);
        expect(callback).toBeCalledWith(event);
    })
});
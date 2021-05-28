import './Form.css';

const _onFocus = (event) => event.target.select();
const Input = (props) => ( // private - do not export
    <input
        {...props}
        onFocus={_onFocus}
        required={true}
    />
);

const _onTextChange = (onChange) => (event) => {
    const value = event.target.value;
    onChange(value);
};
export const TextInput = ({
    value, // the initial value of the input
    onChange, // the function to executed when the value changes
    disabled, // prevents interaction if specified
}) => (

    <Input
        type="text"
        value={value}
        onChange={_onTextChange(onChange)}
        disabled={disabled}
    />
);

const _onNumberChange = (onChange) => (event) => {
    const number = event.target.value || 0;
    onChange(number);
};
export const NumberInput = ({
    value, // the initial value of the input
    onChange, // the function to executed when the value changes
    min, // the minimum value for the input
    max, // the maximum value for the input
}) => (

    <Input
        type="number"
        value={value}
        onChange={_onNumberChange(onChange)}
        min={min}
        max={max}
    />
);

const uniqueName = (name, nameObjects, updateIndex) => {
    for (let i = 0; i < nameObjects.length; i++) {
        const value = nameObjects[i]
        if (name === value.name && i !== updateIndex) {
            return false;
        }
    }
    return true;
};
const _onNameChange = (onChange, values, updateIndex) => (event) => {
    const nameInput = event.target;
    const name = nameInput.value;
    const isUniqueName = uniqueName(name, values, updateIndex);
    nameInput.setCustomValidity(isUniqueName ? '' : 'duplicate name');
    onChange(name);
};
export const NameInput = ({
    value, // the value of the name
    values, // the array of existing objects with name properties
    onChange, // the function to change the value of the name
    updateIndex, // the index of the item being updated - provide a negative number if not updating any index
}) => (
    <Input
        type="text"
        value={value}
        onChange={_onNameChange(onChange, values, updateIndex)}
    />
);

export const ButtonInput = ({
    value, // the text to display on the button
    onClick, // the action to perform when clicked
    disabled, // prevents onClick
}) => (
    <input
        type="button"
        value={value}
        onClick={preventDefault(onClick)}
        disabled={disabled}
    />
);

const _onCheckboxChange = (onChange) => (event) => {
    const checked = event.target.checked;
    onChange(checked);
};
export const CheckboxInput = ({
    checked, // boolean indicating if it is currently checked
    onChange, // the action to perform when clicked.  The first parameter is a boolean indicating the new checked state
}) => (
    <input
        type="checkbox"
        checked={checked}
        onChange={_onCheckboxChange(onChange)}
    />
);

const _onFileChange = (onChange) => (event) => {
    const file = event.target.files[0];
    onChange(file);
};
export const FileInput = ({
    accept, // a csv string of extensions or mime types to make visible
    onChange, // the action to perform when a single file is picked.  The first parameter is the file
}) => (
    <input
        type="file"
        role="button"
        accept={accept}
        onChange={_onFileChange(onChange)}
    />
);

export const SubmitInput = ({
    value, // the value of the submit button
}) => (
    <input
        type="submit"
        value={value || 'Submit'}
    />
);

export const Form = ({
    onSubmit, // function to submit the form, triggered by SubmitInput
    children, // builtin property of the child components of the form 
}) => (
    <form className="Form" onSubmit={preventDefault(onSubmit)}>
        {children}
    </form>
);

const preventDefault = (fn) => (event) => {
    event.preventDefault();
    fn();
};
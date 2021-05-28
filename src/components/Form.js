import './Form.css';

const _onFocus = (event) => event.target.select();
export const Input = ({
    type, // the type of input
    value, // the initial value of the input
    onChange, // the function to executed when the value changes
    min, // the minimum value for the input (type=number only)
    max, // the maximum value for the input (type=number only)
    required, // a boolean indicating if the input is required to submit the form
}) => (

    <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        onFocus={_onFocus}
        required={required}
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

export const NameInput = ({
    value, // the value of the name
    values, // the array of existing objects with name properties
    onChange, // the function to change the value of the name
    updateIndex, // the index of the item being updated - provide a negative number if not updating any index
}) => {
    const updateName = (event) => {
        const nameInput = event.target;
        const name = nameInput.value;
        const isUniqueName = uniqueName(name, values, updateIndex);
        nameInput.setCustomValidity(isUniqueName ? '' : 'duplicate name');
        onChange(name);
    };
    return (
        <Input
            type="text"
            value={value}
            onChange={updateName}
            required={true}
        />
    );
};

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

const _onChange = (setChecked) => (event) => setChecked(event.target.checked)
export const CheckboxInput = ({
    checked, // boolean indicating if it is currently checked
    onChange, // the action to perform when clicked.  The first parameter is a boolean indicating the new checked state
}) => (
    <input
        type="checkbox"
        checked={checked}
        onChange={_onChange(onChange)}
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

const preventDefault = (fn) => {
    return (event) => {
        event.preventDefault();
        fn();
    };
};
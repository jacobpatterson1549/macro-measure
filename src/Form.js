import './Form.css';

const onFocus = (event) => event.target.select();

export const Input = ({
    type, // the type of input
    value, // the initial value of the input
    onChange, // the function to executed when the value changes
    min, // the minimum value for the input (type=number only)
    max, // the maximum value for the input (type=number only)
}) => (

    <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        onFocus={onFocus}
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
    disabled, // the prevents input when true
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
            disabled={disabled}
        />
    );
};

export const ButtonInput = ({
    value, // the text to display on the button
    onClick, // the action to perform when clicked
}) => (
    <input
        type="button"
        value={value}
        onClick={preventDefault(onClick)}
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
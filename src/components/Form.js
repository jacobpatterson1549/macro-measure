import './Form.css';

const Input = (props) => ( // private - do not export
    <input
        onFocus={onFocus}
        required={true}
        {...props}
    />
);

export const TextInput = ({ value, onChange, disabled }) => (
    <Input
        type="text"
        value={value}
        onChange={onTextChange(onChange)}
        disabled={disabled}
    />
);

export const NumberInput = ({ value, onChange, min, max }) => (
    <Input
        type="number"
        value={value}
        onChange={onTextChange(onChange)}
        min={min}
        max={max}
    />
);

export const NameInput = ({ value, values, onChange, updateIndex }) => (
    <Input
        type="text"
        value={value}
        onChange={onNameChange(onChange, values, updateIndex)}
    />
);

export const ButtonInput = ({ value, onClick, disabled }) => (
    <input
        type="button"
        value={value}
        onClick={preventDefault(onClick)}
        disabled={disabled}
    />
);

export const CheckboxInput = ({ checked, onChange }) => (
    <input
        type="checkbox"
        checked={checked}
        onChange={onCheckboxChange(onChange)}
    />
);

export const FileInput = ({ accept, onChange }) => (
    <input
        type="file"
        role="button"
        accept={accept}
        onChange={onFileChange(onChange)}
    />
);

export const SelectInput = ({ value, values, onChange }) => (
    <select value={value} onChange={onTextChange(onChange)}>
        {getOptions(values)}
    </select>
);

export const SubmitInput = ({ value, disabled }) => (
    <input
        type="submit"
        value={value || 'Submit'}
        disabled={disabled}
    />
);

export const Form = ({ onSubmit, children }) => (
    <form className="Form" onSubmit={preventDefault(onSubmit)}>
        {children}
    </form>
);

export const preventDefault = (callback) => (event) => {
    event.preventDefault();
    callback?.(event);
};

const onFocus = (event) => {
    event.target.select();
}

const onTextChange = (onChange) => (event) => {
    const value = event.target.value;
    onChange(value);
};

const onNameChange = (onChange, values, updateIndex) => (event) => {
    const nameInput = event.target;
    const name = nameInput.value;
    const unique = isUniqueName(name, values, updateIndex);
    nameInput.setCustomValidity(unique ? '' : 'duplicate name');
    onChange(name);
};

const onCheckboxChange = (onChange) => (event) => {
    const checked = event.target.checked;
    onChange(checked);
};

const onFileChange = (onChange) => (event) => {
    const file = event.target.files[0];
    onChange(file);
};

const isUniqueName = (name, nameObjects, updateIndex) => (
    nameObjects.length === 0 || nameObjects
        .map((value, i) => (value.name !== name || i === updateIndex))
        .reduce((accumulator, currentValue) => accumulator && currentValue)
);

const getOptions = (values) => (
    values.map((val) => (
        <option key={val}>{val}</option>
    ))
);
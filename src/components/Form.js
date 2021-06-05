import './Form.css';

const Input = (props) => ( // private - do not export
    <input
        onFocus={handleOnFocus()}
        required={true}
        {...props}
    />
);

export const TextInput = ({ value, onChange, disabled }) => (
    <Input
        type="text"
        value={value}
        onChange={handleOnTextChange(onChange)}
        disabled={disabled}
    />
);

export const NumberInput = ({ value, onChange, min, max }) => (
    <Input
        type="number"
        value={value}
        onChange={handleOnTextChange(onChange)}
        min={min}
        max={max}
    />
);

export const NameInput = ({ value, values, onChange, updateIndex }) => (
    <Input
        type="text"
        value={value}
        onChange={handleOnNameChange(onChange, values, updateIndex)}
    />
);

export const ButtonInput = ({ value, onClick, disabled }) => (
    <input
        type="button"
        value={value}
        onClick={handlePreventDefault(onClick)}
        disabled={disabled}
    />
);

export const CheckboxInput = ({ checked, onChange }) => (
    <input
        type="checkbox"
        checked={checked}
        onChange={handleOnCheckboxChange(onChange)}
    />
);

export const FileInput = ({ accept, onChange }) => (
    <input
        type="file"
        role="button"
        accept={accept}
        onChange={handleOnFileChange(onChange)}
    />
);

export const SelectInput = ({ value, values, onChange }) => (
    <select value={value} onChange={handleOnTextChange(onChange)}>
        {getOptions(values)}
    </select>
);

export const Label = ({ caption, children }) => (
    <label className="Label">
        <span>{caption}</span>
        {children}
    </label>
);

export const Fieldset = ({ caption, disabled, border = true, children }) => (
    <fieldset className={'Fieldset' + (!border ? ' NoBorder' : '')} disabled={disabled}>
        {
            caption &&
            <legend>{caption}</legend>
        }
        {children}
    </fieldset>
);

export const Form = ({ onSubmit, submitDisabled, submitValue = 'Submit', onCancel, children }) => (
    <form className="Form" onSubmit={handlePreventDefault(onSubmit)}>
        {children}
        <div className="ActionButtons">
            {
                onCancel &&
                <ButtonInput
                    value="Cancel"
                    onClick={onCancel}
                />
            }
            <input
                type="submit"
                value={submitValue}
                disabled={submitDisabled}
            />
        </div>
    </form>
);

export const handlePreventDefault = (callback) => (event) => {
    event.preventDefault();
    if (callback) {
        callback(event);
    }
};

const handleOnFocus = () => (event) => {
    event.target.select();
}

const handleOnTextChange = (onChange) => (event) => {
    const value = event.target.value;
    onChange(value);
};

const handleOnNameChange = (onChange, values, updateIndex) => (event) => {
    const nameInput = event.target;
    const name = nameInput.value;
    const unique = isUniqueName(name, values, updateIndex);
    nameInput.setCustomValidity(unique ? '' : 'duplicate name');
    onChange(name);
};

const handleOnCheckboxChange = (onChange) => (event) => {
    const checked = event.target.checked;
    onChange(checked);
};

const handleOnFileChange = (onChange) => (event) => {
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
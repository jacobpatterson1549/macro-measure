import { render, screen } from '@testing-library/react';

import { useLocalStorage } from './LocalStorage';

import { getLocalStorage } from '../utils/Global';

describe('LocalStorage', () => {
    describe('useLocalStorage', () => {
        const key = 'key';
        const MockComponent = ({
            defaultValue,
            clickValue,
        }) => {
            const [value, setValue] = useLocalStorage(key, defaultValue);
            const handleSetValue = () => () => setValue(clickValue)
            return (
                <p onClick={handleSetValue()}>{value}</p>
            );
        };
        it('should get defaultValue', () => {
            const expected = 'test1';
            render(<MockComponent defaultValue={expected} />);
            const element = screen.getByText(expected);
            expect(element).toBeInTheDocument();
            expect(getLocalStorage().getItem).toBeCalledWith(key);
        });
        it('should get the saved value', () => {
            const expected = 'test2';
            const json = `"${expected}"`;
            getLocalStorage().getItem.mockReturnValue(json);
            render(<MockComponent />);
            const element = screen.getByText(expected);
            expect(element).toBeInTheDocument();
            expect(getLocalStorage().getItem).toBeCalledWith(key);
        });
        it('should setItem when clicked', () => {
            const before = 'this should not be saved';
            const expected = 'test3';
            const expectedJSON = `"${expected}"`;
            render(<MockComponent defaultValue={before} clickValue={expected} />);
            const element = screen.getByText(before);
            element.click();
            expect(getLocalStorage().setItem).toBeCalledWith(key, expectedJSON);
        });
        it('should setItem five times when clicked five times', () => {
            const before = 'this should not be saved';
            const expected = 'test3';
            render(<MockComponent defaultValue={before} clickValue={expected} />);
            const element = screen.getByText(before);
            element.click();
            element.click();
            element.click();
            element.click();
            element.click();
            expect(getLocalStorage().setItem).toBeCalledTimes(5);
        });
    });
});
import { screen, render } from '@testing-library/react';

import { ErrorBoundary } from './ErrorBoundary';

import { clear as clearLocalStorage } from '../utils/LocalStorage';

jest.mock('../utils/LocalStorage')

describe('ErrorBoundary', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error'); // disable error logging for tests
    });
    const errorBoundaryText = 'Something went wrong.';
    const falsyErrorMessages = [
        '',
        0,
        null,
        undefined,
    ];
    it('should not render for a valid component', () => {
        const validComponentText = 'valid component';
        const ValidComponent = () => (
            <p>{validComponentText}</p>
        );
        render(
            <ErrorBoundary>
                <ValidComponent />
            </ErrorBoundary>
        );
        expect(screen.queryByText(errorBoundaryText)).not.toBeInTheDocument();
        expect(screen.queryByText(validComponentText)).toBeInTheDocument();
    });
    it.each(falsyErrorMessages)('should render when an error exists without a message: %s', (message) => {
        const InvalidComponent = () => {
            throw new Error(message);
        };
        render(
            <ErrorBoundary>
                <InvalidComponent />
            </ErrorBoundary>
        );
        expect(screen.queryByText(errorBoundaryText)).toBeInTheDocument();
        expect(clearLocalStorage).toBeCalled();
    });
});
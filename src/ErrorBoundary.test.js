import { mount, screen, fireEvent, createEvent, render } from '@testing-library/react';

import { ErrorBoundary } from './ErrorBoundary';

describe('Error Boundary', () => {
    let consoleError
    beforeAll(() => {
        consoleError = console.error;
        console.error = jest.fn();
    })
    afterAll(() => {
        console.Error = consoleError;
    })

    const errorBoundaryText = 'Something went wrong.';

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

    const errorMessages = ['MockErrorMessage', '', 0, null, undefined];
    test.each(errorMessages)('should render when an error exists with message: %s', (message) => {
        const InvalidComponent = () => {
            throw new Error(message);
        };
        render(
            <ErrorBoundary>
                <InvalidComponent />
            </ErrorBoundary>
        );
        expect(screen.queryByText(errorBoundaryText)).toBeInTheDocument();
        if (message) {
            expect(screen.queryByText(message)).toBeInTheDocument();
        }
    });
});
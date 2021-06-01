import { render, screen, fireEvent, createEvent } from '@testing-library/react';

import { Window } from './Window';

describe('Window', () => {
    const MockApp = ({ win }) => (
        <div>
            <p title="fullscreen">{String(win.fullscreen)}</p>
            <p title="onLine">{String(win.onLine)}</p>
            {
                win.installPromptEvent &&
                <button>INSTALL</button>
            }
        </div>
    );
    const tests = [
        [true, true],
        [true, false],
        [false, true],
        [false, false],
    ];
    describe('fullscreen', () => {
        it.each(tests)('should initially be fullscreen=%s then transition to fullscreen=%s', (initial, transition) => {
            document.fullscreenElement = initial ? {} : null;
            render(<Window render={win => (<MockApp win={win} />)} />);
            const element = screen.getByTitle('fullscreen');
            expect(element.textContent).toBe(String(initial));
            const event = createEvent('fullscreenchange', window);
            document.fullscreenElement = transition ? {} : null;
            fireEvent(window, event);
            expect(element.textContent).toBe(String(transition));
        });
    });
    describe('onLine', () => {
        it.each(tests)('should initially be onLine=%s then transition to onLine=%s', (initial, transition) => {
            window.navigator.onLine = initial;
            render(<Window render={win => (<MockApp win={win} />)} />);
            const element = screen.getByTitle('onLine');
            expect(element.textContent).toBe(String(initial));
            const event = createEvent(transition ? 'online' : 'offline', window);
            fireEvent(window, event);
            expect(element.textContent).toBe(String(transition));
        });
    });
    describe('promptInstall', () => {
        const mockOnbeforeinstallprompt = () => {
            // test procedure from https://github.com/testing-library/testing-library-docs/issues/798
            const event = createEvent('beforeinstallprompt', window);
            Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
            fireEvent(window, event);
            return event
        };
        it('should not have the install button when no beforeinstallprompt event is fired', () => {
            render(<Window render={win => (<MockApp win={win} />)} />);
            const element = screen.queryByRole('button');
            expect(element).not.toBeInTheDocument();
        });
        it('should have the install button when the event is fired', () => {
            render(<Window render={win => (<MockApp win={win} />)} />);
            mockOnbeforeinstallprompt();
            const element = screen.queryByRole('button');
            expect(element).toBeInTheDocument();
        });
        it('should preventDefault when the event is fired', () => {
            render(<Window render={win => (<MockApp win={win} />)} />);
            const event = mockOnbeforeinstallprompt();
            expect(event.preventDefault).toBeCalled();
        });
    });
});
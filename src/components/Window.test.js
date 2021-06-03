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
    describe('fullscreen', () => {
        const tests = [
            [true, {}],
            [false, null],
        ];
        it.each(tests)('should initially be fullscreen=%s', (initial, initialFullscreenElement) => {
            document.fullscreenElement = initialFullscreenElement;
            render(<Window render={win => (<MockApp win={win} />)} />);
            const element = screen.getByTitle('fullscreen');
            expect(element.textContent).toBe(String(initial));
        });
        it.each(tests)('should transition to fullscreen=%s', (transition, transitionFullscreenElement) => {
            render(<Window render={win => (<MockApp win={win} />)} />);
            const element = screen.getByTitle('fullscreen');
            const event = createEvent('fullscreenchange', window);
            document.fullscreenElement = transitionFullscreenElement;
            fireEvent(window, event);
            expect(element.textContent).toBe(String(transition));
        });
    });
    describe('onLine', () => {
        const tests = [
            [true, true, 'online'],
            [true, false, 'offline'],
            [false, true, 'online'],
            [false, false, 'offline'],
        ];
        it.each(tests)('should initially be onLine=%s then transition to onLine=%s when %s event is fired', (initial, expected, eventName) => {
            window.navigator.onLine = initial;
            render(<Window render={win => (<MockApp win={win} />)} />);
            const element = screen.getByTitle('onLine');
            expect(element.textContent).toBe(String(initial));
            const event = createEvent(eventName, window);
            fireEvent(window, event);
            expect(element.textContent).toBe(String(expected));
        });
    });
    describe('promptInstall', () => {
        const mockAndFireOnbeforeinstallprompt = () => {
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
            mockAndFireOnbeforeinstallprompt();
            const element = screen.queryByRole('button');
            expect(element).toBeInTheDocument();
        });
        it('should preventDefault when the event is fired', () => {
            render(<Window render={win => (<MockApp win={win} />)} />);
            const event = mockAndFireOnbeforeinstallprompt();
            expect(event.preventDefault).toBeCalled();
        });
    });
});
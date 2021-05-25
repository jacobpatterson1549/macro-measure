import { render, screen, fireEvent, createEvent, waitFor, act } from '@testing-library/react';

import { Window } from './Window';

describe('Window', () => {
    const MockApp = ({ win }) => {
        return (
            <div>
                <p title="fullscreen">{String(win.fullscreen)}</p>
                <p title="onLine">{String(win.onLine)}</p>
                {
                    win.promptInstall &&
                    <button onClick={async () => await win.promptInstall}>INSTALL</button>
                }
            </div>
        );
    };
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
        const mockOnbeforeinstallprompt = (accepted) => {
            // test procedure from https://github.com/testing-library/testing-library-docs/issues/798
            const event = createEvent('beforeinstallprompt', window);
            Object.defineProperties(event, {
                preventDefault: { value: jest.fn() },
                userChoice: { value: { outcome: accepted } },
                prompt: { value: jest.fn() },
            });
            fireEvent(window, event);
            return event
        };
        it('should not have the install button when no beforeinstallprompt event is fired', () => {
            render(<Window render={win => (<MockApp win={win} />)} />);
            const element = screen.queryByRole('button');
            expect(element).not.toBeInTheDocument();
        });
        it('should have the install button when the event is fired', async () => {
            render(<Window render={win => (<MockApp win={win} />)} />);
            await mockOnbeforeinstallprompt();
            const element = screen.queryByRole('button');
            expect(element).toBeInTheDocument();
        });
        it('should preventDefault when the event is fired', async () => {
            render(<Window render={win => (<MockApp win={win} />)} />);
            const event = await mockOnbeforeinstallprompt();
            expect(event.preventDefault).toBeCalled();
        });
        it('should call prompt when the install button is clicked', async () => {
            render(<Window render={win => (<MockApp win={win} />)} />);
            const event = mockOnbeforeinstallprompt();
            const element = screen.queryByRole('button');
            await waitFor(() => fireEvent.click(element));
            expect(event.prompt).toBeCalled();
        });
        it('should remove install button from the document when "accepted" is the choiceResult of the prompt', async () => {
            render(<Window render={win => (<MockApp win={win} />)} />);
            mockOnbeforeinstallprompt('accepted');
            const element = screen.queryByRole('button');
            await waitFor(() => fireEvent.click(element));
            expect(element).not.toBeInTheDocument();
        });
        it.each(['dismissed', 'not accepted', null])('should keep install button in the document when "%s" is the choiceResult of the prompt', async (accepted) => {
            render(<Window render={win => (<MockApp win={win} />)} />);
            mockOnbeforeinstallprompt(accepted);
            const element = screen.queryByRole('button');
            await waitFor(() => fireEvent.click(element));
            expect(element).toBeInTheDocument();
        });
    });
});
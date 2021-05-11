import { render, screen, fireEvent } from '@testing-library/react';

import { CondSpan } from './CondSpan';

describe('CondSpan', () => {
    test('no-cond prop', () => {
        render(<CondSpan value="XYZ" />);
        const condSpan = screen.queryByText('XYZ');
        expect(condSpan).not.toBeInTheDocument();
    });
    test('cond', () => {
        render(<CondSpan cond={true} value="XYZ" />);
        const condSpan = screen.queryByText('XYZ');
        expect(condSpan).toBeInTheDocument();
    });
    test('cond with title', () => {
        render(<CondSpan cond={true} title="some title" value="XYZ" />);
        const condSpan = screen.queryByTitle('some title');
        expect(condSpan).toBeInTheDocument();
    });
    test('cond with onClick', () => {
        const handleClick = jest.fn();
        render(<CondSpan cond={true} onClick={handleClick} title="some title" value="XYZ" />);
        const condSpan = screen.queryByText('XYZ');
        fireEvent.click(condSpan);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
    test('not cond', () => {
        render(<CondSpan cond={false} value="XYZ" />);
        const condSpan = screen.queryByText('XYZ');
        expect(condSpan).not.toBeInTheDocument();
    });
});

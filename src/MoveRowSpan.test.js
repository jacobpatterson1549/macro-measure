import { render, screen, fireEvent } from '@testing-library/react';
import MoveRowSpan from './MoveRowSpan';

describe('MoveRowSpan', () => {
    test('no-valid prop', () => {
        render(<MoveRowSpan value="XYZ" />);
        const moveRowSpan = screen.queryByText('XYZ');
        expect(moveRowSpan).not.toBeInTheDocument();
    });
    test('valid', () => {
        render(<MoveRowSpan valid={true} value="XYZ" />);
        const moveRowSpan = screen.queryByText('XYZ');
        expect(moveRowSpan).toBeInTheDocument();
    });
    test('valid with title', () => {
        render(<MoveRowSpan valid={true} title="some title" value="XYZ" />);
        const moveRowSpan = screen.queryByTitle('some title');
        expect(moveRowSpan).toBeInTheDocument();
    });
    test('valid with onClick', () => {
        const handleClick = jest.fn();
        render(<MoveRowSpan valid={true} onClick={handleClick} title="some title" value="XYZ" />);
        const moveRowSpan = screen.queryByText('XYZ');
        fireEvent.click(moveRowSpan);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
    test('not valid', () => {
        render(<MoveRowSpan valid={false} value="XYZ" />);
        const moveRowSpan = screen.queryByText('XYZ');
        expect(moveRowSpan).not.toBeInTheDocument();
    });
});

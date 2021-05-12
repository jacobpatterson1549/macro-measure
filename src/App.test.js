import { render, screen } from '@testing-library/react';

import App from './App';

test('has headers', () => {
  render(<App />);
  const linkElement = screen.getByText(/[?]/i);
  expect(linkElement).toBeInTheDocument();
});

describe('groups link', () => {
  test.each`
      view             | grpName     | expected
      ${null}          | ${null}     | ${'[Groups]'}
      ${'settings'}    | ${'any'}    | ${'[Groups]'}
      ${'groups'}      | ${'ignore'} | ${'[Groups]'}
      ${'items'}       | ${'groupA'} | ${'groupA'}
      ${'item-create'} | ${'groupB'} | ${'groupB'}
      ${'item-read'}   | ${'groupC'} | ${'groupC'}
      ${'item-update'} | ${'groupD'} | ${'groupD'}
  `('text content should be $expected when view is $view and current group name is $grpName', ({ view, grpName, expected }) => {
      render(<Header view={view} currentGroupName={grpName} />);
      const groupElement = screen.getByTitle(/group/);
      expect(groupElement).toHaveTextContent(expected);
  });
  test('onClick should call setView', () => {
      const handleClick = jest.fn();
      render(<Header setView={handleClick} />);
      const groupsElement = screen.getByTitle(/group/);
      fireEvent.click(groupsElement);
      expect(handleClick).toHaveBeenCalledWith('groups');
  });
});
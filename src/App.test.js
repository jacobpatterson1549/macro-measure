import { render, screen } from '@testing-library/react';

import App from './App';
import { LocalStorageMock } from './LocalStorage.test'

test('has headers', () => {
  render(<App />);
  const linkElement = screen.getByText(/[?]/i);
  expect(linkElement).toBeInTheDocument();
});

test.each`
      view             | grpName     | expected
      ${null}          | ${null}     | ${'[Groups]'}
      ${'settings'}    | ${'any'}    | ${'[Groups]'}
      ${'groups'}      | ${'ignore'} | ${'[Groups]'}
      ${'items'}       | ${'groupA'} | ${'groupA'}
      ${'item-create'} | ${'groupB'} | ${'groupB'}
      ${'item-read'}   | ${'groupC'} | ${'groupC'}
      ${'item-update'} | ${'groupD'} | ${'groupD'}
      ${'item-delete'} | ${'groupE'} | ${'groupE'}
  `('groups header text content should be $expected when view is $view and current group name is $grpName', ({ view, grpName, expected }) => {
  const store = {
    view: view,
    groups: JSON.stringify([{ name: grpName, items: [{}] }]),
    currentGroupIndex: '0',
    currentItemIndex: '0',
  };
  const storage = new LocalStorageMock(store);
  render(<App storage={storage} />);
  const groupElement = screen.getByTitle(/group/);
  expect(groupElement).toHaveTextContent(expected);
});
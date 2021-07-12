import { render, screen } from '@testing-library/react';

import { Root } from './Root';

import { useItem, useItems } from '../hooks/Database';

import { View } from '../utils/View';
import { getLocalStorage } from '../utils/Global';

jest.mock('../hooks/Database', () => ({
  createHandlers: jest.fn(),
  useItem: jest.fn(),
  useItems: jest.fn(),
}));
jest.mock('../utils/Global', () => ({
  addWindowEventListener: jest.fn(),
  removeWindowEventListener: jest.fn(),
  getLocalStorage: jest.fn(),
}));

describe('Root', () => {
  beforeEach(() => {
    useItem.mockReturnValue([]);
    useItems.mockReturnValue([]);
    getLocalStorage.mockReturnValue({ getItem: jest.fn() });
  });
  it('should have help header in the document', () => {
    render(<Root />);
    const linkElement = screen.getByText('?');
    expect(linkElement).toBeInTheDocument();
  });
  it('should default gpsOn to false', () => {
    render(<Root />);
    const element = screen.getByText((content, element) => (
      element.textContent === 'GPS: OFF'
    ));
    expect(element).toBeInTheDocument();
  });
  it('should switch view to Waypoint_List when on Group_Read', () => {
    getLocalStorage.mockReturnValue({
      getItem: () => View.Group_Read,
      setItem: jest.fn(),
    });
    render(<Root />);
    const element = screen.getByText(/waypoint values/i);
    expect(element).toBeInTheDocument();
  });
});
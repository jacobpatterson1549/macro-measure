import { render, screen } from '@testing-library/react';

import { Root } from './Root';

import { useItem, useItems } from '../hooks/Database';

import { View } from '../utils/View';
import { getLocalStorage } from '../utils/Global';

jest.mock('../hooks/Database');

describe('Root', () => {
  beforeEach(() => {
    useItem.mockReturnValue([]);
    useItems.mockReturnValue([]);
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
    getLocalStorage().getItem.mockReturnValue(View.Group_Read);
    render(<Root />);
    const element = screen.getByText(/waypoint values/i);
    expect(element).toBeInTheDocument();
  });
});
import { View } from './View';

describe('View', () => {
  it('should have have no duplicates', () => {
    const views = {};
    Object.values(View).forEach((view) => {
      expect(views[view]).toBeFalsy();
      views[view] = true;
    });
  });
});
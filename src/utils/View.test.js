import { View } from './View';

describe('View', () => {
  it('should have have no duplicates', () => {
    const views = {};
    Object.values(View).map((view) => {
      expect(views[view]).toBeFalsy();
      views[view] = true;
    });
  });
});
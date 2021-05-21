import { View } from './View';

describe('view', () => {
  it('should have have no duplicates', () => {
    const views = {};
    Object.entries(View).forEach(([_, view]) => {
      expect(views[view]).toBeFalsy();
      views[view] = true;
    });
  });
});
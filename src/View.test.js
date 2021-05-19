import { View } from './View';

test('should have no duplicate views', () => {
  const views = {};
  Object.entries(View).forEach(([_, view]) => {
      expect(views[view]).toBeFalsy();
      views[view] = true;
  });
});
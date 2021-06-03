import { View } from './View';

describe('View', () => {
  const views = Object.values(View).filter(Number.isInteger);
  it('should have no duplicate ids', () => {
    const ids = {};
    views.forEach((view) => {
      expect(ids[view]).toBeFalsy();
      ids[view] = true;
    });
  });
  it('should not have view with an id of zero', () => {
    const zeroIdViews = views.filter((view) => view === 0);
    expect(zeroIdViews.length).toBe(0);
  });
  it.each(views)('should have desired flags when view is id:%s', (view) => {
    expect(View.isCreate(view)).toBe([View.Group_Create, View.Item_Create].includes(view));
    expect(View.isRead(view)).toBe([View.Group_Read_List, View.Item_Read_List, View.Item_Read].includes(view));
    expect(View.isUpdate(view)).toBe([View.Group_Update, View.Item_Update].includes(view));
    expect(View.isDelete(view)).toBe([View.Group_Delete, View.Item_Delete].includes(view));
    expect(View.needsGPS(view)).toBe([View.Item_Read, View.Item_Create].includes(view));
    expect(View.isItem(view)).toBe([View.Item_Create, View.Item_Read, View.Item_Read_List, View.Item_Update, View.Item_Delete].includes(view));
    expect(View.isGroup(view)).toBe([View.Group_Create, View.Group_Read_List, View.Group_Update, View.Group_Delete].includes(view));
  })
});
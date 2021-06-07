import { View } from './View';

describe('View', () => {
  const views = Object.values(View).filter(Number.isInteger);
  it('should have no duplicate ids', () => {
    const ids = {};
    views.forEach((viewId) => {
      expect(ids[viewId]).toBeFalsy();
      ids[viewId] = true;
    });
  });
  it('should not have view with an id of zero', () => {
    const zeroIdViews = views.filter((viewId) => !viewId);
    expect(zeroIdViews.length).toBe(0);
  });
  it.each(views)('should have desired flags when view is id:%s', (viewId) => {
    expect(View.isCreate(viewId)).toBe([View.Group_Create, View.Item_Create].includes(viewId));
    expect(View.isRead(viewId)).toBe([View.Group_Read_List, View.Item_Read_List, View.Item_Read].includes(viewId));
    expect(View.isUpdate(viewId)).toBe([View.Group_Update, View.Item_Update].includes(viewId));
    expect(View.isDelete(viewId)).toBe([View.Group_Delete, View.Item_Delete].includes(viewId));
    expect(View.needsGPS(viewId)).toBe([View.Item_Read, View.Item_Create].includes(viewId));
    expect(View.isItem(viewId)).toBe([View.Item_Create, View.Item_Read, View.Item_Read_List, View.Item_Update, View.Item_Delete].includes(viewId));
    expect(View.isGroup(viewId)).toBe([View.Group_Create, View.Group_Read_List, View.Group_Update, View.Group_Delete].includes(viewId));
  })
});
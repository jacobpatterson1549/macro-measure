import { View } from './View';

describe('View', () => {
  it('should have all views in AllIds', () => {
    const views = Object.values(View).filter(Number.isInteger);
    expect(View.AllIDs).toStrictEqual(views);
  });
  it('should have no duplicate ids', () => {
    const ids = {};
    View.AllIDs.forEach((viewId) => {
      expect(ids[viewId]).toBeFalsy();
      ids[viewId] = true;
    });
  });
  it('should not have view with an id of zero', () => {
    const zeroIdViews = View.AllIDs.filter((viewId) => !viewId);
    expect(zeroIdViews.length).toBe(0);
  });
  const expectedIsCreateViewIds = [View.Group_Create, View.Item_Create];
  const expectedIsReadViewIds = [View.Group_Read, View.Item_Read];
  const expectedIsListViewIds = [View.Group_List, View.Item_List];
  const expectedIsUpdateViewIds = [View.Group_Update, View.Item_Update];
  const expectedIsDeleteViewIds = [View.Group_Delete, View.Item_Delete];
  const expectedIsNeedsGPSViewIds = [View.Item_Read, View.Item_Create];
  const expectedIsItemViewIds = [View.Item_Create, View.Item_Read, View.Item_List, View.Item_Update, View.Item_Delete];
  const expectedIsGroupViewIds = [View.Group_Create, View.Group_Read, View.Group_List, View.Group_Update, View.Group_Delete];
  it.each(View.AllIDs)('should have desired flags when view is id:%s', (viewId) => {
    expect(View.isCreate(viewId)).toBe(expectedIsCreateViewIds.includes(viewId));
    expect(View.isRead(viewId)).toBe(expectedIsReadViewIds.includes(viewId));
    expect(View.isList(viewId)).toBe(expectedIsListViewIds.includes(viewId));
    expect(View.isUpdate(viewId)).toBe(expectedIsUpdateViewIds.includes(viewId));
    expect(View.isDelete(viewId)).toBe(expectedIsDeleteViewIds.includes(viewId));
    expect(View.needsGPS(viewId)).toBe(expectedIsNeedsGPSViewIds.includes(viewId));
    expect(View.isItem(viewId)).toBe(expectedIsItemViewIds.includes(viewId));
    expect(View.isGroup(viewId)).toBe(expectedIsGroupViewIds.includes(viewId));
  });
});
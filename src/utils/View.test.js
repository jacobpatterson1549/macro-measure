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
  const expectedIsCreateViewIds = [View.Group_Create, View.Waypoint_Create];
  const expectedIsReadViewIds = [View.Group_Read, View.Waypoint_Read];
  const expectedIsListViewIds = [View.Group_List, View.Waypoint_List];
  const expectedIsUpdateViewIds = [View.Group_Update, View.Waypoint_Update];
  const expectedIsDeleteViewIds = [View.Group_Delete, View.Waypoint_Delete];
  const expectedIsNeedsGPSViewIds = [View.Waypoint_Read, View.Waypoint_Create];
  const expectedIsWaypointViewIds = [View.Waypoint_Create, View.Waypoint_Read, View.Waypoint_List, View.Waypoint_Update, View.Waypoint_Delete];
  const expectedIsGroupViewIds = [View.Group_Create, View.Group_Read, View.Group_List, View.Group_Update, View.Group_Delete];
  it.each(View.AllIDs)('should have desired flags when view is id:%s', (viewId) => {
    expect(View.isCreate(viewId)).toBe(expectedIsCreateViewIds.includes(viewId));
    expect(View.isRead(viewId)).toBe(expectedIsReadViewIds.includes(viewId));
    expect(View.isList(viewId)).toBe(expectedIsListViewIds.includes(viewId));
    expect(View.isUpdate(viewId)).toBe(expectedIsUpdateViewIds.includes(viewId));
    expect(View.isDelete(viewId)).toBe(expectedIsDeleteViewIds.includes(viewId));
    expect(View.needsGPS(viewId)).toBe(expectedIsNeedsGPSViewIds.includes(viewId));
    expect(View.isWaypoint(viewId)).toBe(expectedIsWaypointViewIds.includes(viewId));
    expect(View.isGroup(viewId)).toBe(expectedIsGroupViewIds.includes(viewId));
  });
});
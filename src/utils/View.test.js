import { View } from './View';

describe('View', () => {
  it('should have all views in AllIDs', () => {
    const views = Object.values(View).filter(Number.isInteger);
    expect(View.AllIDs).toStrictEqual(views);
  });
  it('should have no duplicate ids', () => {
    const ids = {};
    View.AllIDs.forEach((ViewIDs) => {
      expect(ids[ViewIDs]).toBeFalsy();
      ids[ViewIDs] = true;
    });
  });
  it('should not have view with an id of zero', () => {
    const zeroIDViews = View.AllIDs.filter((ViewIDs) => !ViewIDs);
    expect(zeroIDViews.length).toBe(0);
  });
  const expectedIsCreateViewIDs = [View.Group_Create, View.Waypoint_Create, View.Map_Create];
  const expectedIsReadViewIDs = [View.Group_Read, View.Waypoint_Read, View.Map_Read];
  const expectedIsListViewIDs = [View.Group_List, View.Waypoint_List, View.Map_List];
  const expectedIsUpdateViewIDs = [View.Group_Update, View.Waypoint_Update, View.Map_Update];
  const expectedIsDeleteViewIDs = [View.Group_Delete, View.Waypoint_Delete, View.Map_Delete];
  const expectedIsNeedsGPSViewIDs = [View.Waypoint_Read, View.Waypoint_Create];
  const expectedIsWaypointViewIDs = [View.Waypoint_Create, View.Waypoint_Read, View.Waypoint_List, View.Waypoint_Update, View.Waypoint_Delete];
  const expectedIsGroupViewIDs = [View.Group_Create, View.Group_Read, View.Group_List, View.Group_Update, View.Group_Delete];
  const expectedIsMapViewIDs = [View.Map_Create, View.Map_Read, View.Map_List, View.Map_Update, View.Map_Delete];
  it.each(View.AllIDs)('should have desired flags when view is id:%s', (ViewIDs) => {
    expect(View.isCreate(ViewIDs)).toBe(expectedIsCreateViewIDs.includes(ViewIDs));
    expect(View.isRead(ViewIDs)).toBe(expectedIsReadViewIDs.includes(ViewIDs));
    expect(View.isList(ViewIDs)).toBe(expectedIsListViewIDs.includes(ViewIDs));
    expect(View.isUpdate(ViewIDs)).toBe(expectedIsUpdateViewIDs.includes(ViewIDs));
    expect(View.isDelete(ViewIDs)).toBe(expectedIsDeleteViewIDs.includes(ViewIDs));
    expect(View.needsGPS(ViewIDs)).toBe(expectedIsNeedsGPSViewIDs.includes(ViewIDs));
    expect(View.isWaypoint(ViewIDs)).toBe(expectedIsWaypointViewIDs.includes(ViewIDs));
    expect(View.isGroup(ViewIDs)).toBe(expectedIsGroupViewIDs.includes(ViewIDs));
    expect(View.isMap(ViewIDs)).toBe(expectedIsMapViewIDs.includes(ViewIDs));
  });
});
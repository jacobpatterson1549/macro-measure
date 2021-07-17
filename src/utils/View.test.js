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
  const expectedIsCreateViewIDss = [View.Group_Create, View.Waypoint_Create];
  const expectedIsReadViewIDss = [View.Group_Read, View.Waypoint_Read];
  const expectedIsListViewIDss = [View.Group_List, View.Waypoint_List];
  const expectedIsUpdateViewIDss = [View.Group_Update, View.Waypoint_Update];
  const expectedIsDeleteViewIDss = [View.Group_Delete, View.Waypoint_Delete];
  const expectedIsNeedsGPSViewIDss = [View.Waypoint_Read, View.Waypoint_Create];
  const expectedIsWaypointViewIDss = [View.Waypoint_Create, View.Waypoint_Read, View.Waypoint_List, View.Waypoint_Update, View.Waypoint_Delete];
  const expectedIsGroupViewIDss = [View.Group_Create, View.Group_Read, View.Group_List, View.Group_Update, View.Group_Delete];
  it.each(View.AllIDs)('should have desired flags when view is id:%s', (ViewIDs) => {
    expect(View.isCreate(ViewIDs)).toBe(expectedIsCreateViewIDss.includes(ViewIDs));
    expect(View.isRead(ViewIDs)).toBe(expectedIsReadViewIDss.includes(ViewIDs));
    expect(View.isList(ViewIDs)).toBe(expectedIsListViewIDss.includes(ViewIDs));
    expect(View.isUpdate(ViewIDs)).toBe(expectedIsUpdateViewIDss.includes(ViewIDs));
    expect(View.isDelete(ViewIDs)).toBe(expectedIsDeleteViewIDss.includes(ViewIDs));
    expect(View.needsGPS(ViewIDs)).toBe(expectedIsNeedsGPSViewIDss.includes(ViewIDs));
    expect(View.isWaypoint(ViewIDs)).toBe(expectedIsWaypointViewIDss.includes(ViewIDs));
    expect(View.isGroup(ViewIDs)).toBe(expectedIsGroupViewIDss.includes(ViewIDs));
  });
});
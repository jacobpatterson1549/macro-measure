const flags = {
    isCreate: 1 << 0,
    isRead: 1 << 1,
    isUpdate: 1 << 2,
    isDelete: 1 << 3,
    isList: 1 << 7,
    needsGPS: 1 << 4,
    isWaypoint: 1 << 5,
    isGroup: 1 << 6,
}

const views = { // name: [id, flags]
    About: [1],
    Help: [2],
    Settings: [3],
    Waypoint_Create: [4, flags.isCreate | flags.isWaypoint | flags.needsGPS],
    Waypoint_Read: [5, flags.isRead | flags.isWaypoint | flags.needsGPS],
    Waypoint_List: [6, flags.isList | flags.isWaypoint],
    Waypoint_Update: [7, flags.isUpdate | flags.isWaypoint],
    Waypoint_Delete: [8, flags.isDelete | flags.isWaypoint],
    Group_Create: [9, flags.isCreate | flags.isGroup],
    Group_Read: [10, flags.isRead | flags.isGroup],
    Group_List: [11, flags.isList | flags.isGroup],
    Group_Update: [12, flags.isUpdate | flags.isGroup],
    Group_Delete: [13, flags.isDelete | flags.isGroup],
};

const viewIdsByName = Object.fromEntries(
    Object.entries(views)
        .map(([name, view]) => [name, view[0]]));

const viewFlagsById = Object.fromEntries(
    Object.entries(views)
        .map(([_, view]) => [view[0], view[1]]));

const allIds = Object.values(viewIdsByName);

const handleIsFlag = (flag) => (viewId) => ( // true if viewId has flag
    !!(viewFlagsById[viewId] & flag)
);

const isFlagFuncs = Object.fromEntries(
    Object.entries(flags)
        .map(([name, flag]) => [name, handleIsFlag(flag)]));

export const View = {
    ...viewIdsByName,
    ...isFlagFuncs,
    AllIDs: allIds,
};
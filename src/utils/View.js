const CREATE = 1 << 0;
const READ = 1 << 1;
const UPDATE = 1 << 2;
const DELETE = 1 << 3;
const NEEDS_GPS = 1 << 4;
const HAS_GROUP = 1 << 5;

const views = { // name: [id, flags]
    About: [1],
    Help: [2],
    Settings: [3],
    Item_Create: [4, CREATE | HAS_GROUP | NEEDS_GPS],
    Item_Read: [5, READ | HAS_GROUP | NEEDS_GPS],
    Item_Read_List: [6, READ | HAS_GROUP],
    Item_Update: [7, UPDATE | HAS_GROUP],
    Item_Delete: [8, DELETE | HAS_GROUP],
    Group_Create: [9, CREATE],
    Group_Read_List: [10, READ],
    Group_Update: [11, UPDATE],
    Group_Delete: [12, DELETE],
};

const viewIdsByName = Object.fromEntries(
    Object.entries(views)
        .map(([name, view]) => [name, view[0]]));

const viewFlagsById = Object.fromEntries(
    Object.entries(views)
        .map(([_, view]) => [view[0], view[1]]));

const viewFuncs = {
    isCreate: (viewId) => !!(viewFlagsById[viewId] & CREATE),
    isRead: (viewId) => !!(viewFlagsById[viewId] & READ),
    isUpdate: (viewId) => !!(viewFlagsById[viewId] & UPDATE),
    isDelete: (viewId) => !!(viewFlagsById[viewId] & DELETE),
    hasGroup: (viewId) => !!(viewFlagsById[viewId] & HAS_GROUP),
    needsGPS: (viewId) => !!(viewFlagsById[viewId] & NEEDS_GPS),
};

export const View = Object.assign({},
    viewIdsByName,
    viewFuncs);
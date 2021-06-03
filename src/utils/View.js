const CREATE = 1 << 0;
const READ = 1 << 1;
const UPDATE = 1 << 2;
const DELETE = 1 << 3;
const NEEDS_GPS = 1 << 4;
const IS_ITEM = 1 << 5;
const IS_GROUP = 1 << 6;

const views = { // name: [id, flags]
    About: [1],
    Help: [2],
    Settings: [3],
    Item_Create: [4, CREATE | IS_ITEM | NEEDS_GPS],
    Item_Read: [5, READ | IS_ITEM | NEEDS_GPS],
    Item_Read_List: [6, READ | IS_ITEM],
    Item_Update: [7, UPDATE | IS_ITEM],
    Item_Delete: [8, DELETE | IS_ITEM],
    Group_Create: [9, CREATE | IS_GROUP],
    Group_Read_List: [10, READ | IS_GROUP],
    Group_Update: [11, UPDATE | IS_GROUP],
    Group_Delete: [12, DELETE | IS_GROUP],
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
    needsGPS: (viewId) => !!(viewFlagsById[viewId] & NEEDS_GPS),
    isItem: (viewId) => !!(viewFlagsById[viewId] & IS_ITEM),
    isGroup: (viewId) => !!(viewFlagsById[viewId] & IS_GROUP),
};

export const View = {
    ...viewIdsByName,
    ...viewFuncs,
};
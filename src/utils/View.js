const CREATE = 1 << 0;
const READ = 1 << 1;
const UPDATE = 1 << 2;
const DELETE = 1 << 3;
const NEEDS_GPS = 1 << 4;
const HAS_GROUP = 1 << 5;

const views = {
    About: 1,
    Help: 2,
    Settings: 3,
    Item_Create: 4,
    Item_Read: 5,
    Item_Read_List: 6,
    Item_Update: 7,
    Item_Delete: 8,
    Group_Create: 9,
    Group_Read_List: 10,
    Group_Update: 11,
    Group_Delete: 12,
};

const flags = {
    [views.About]: 0,
    [views.Help]: 0,
    [views.Settings]: 0,
    [views.Item_Create]: CREATE | HAS_GROUP | NEEDS_GPS,
    [views.Item_Read]: READ | HAS_GROUP | NEEDS_GPS,
    [views.Item_Update]: UPDATE | HAS_GROUP,
    [views.Item_Delete]: DELETE | HAS_GROUP,
    [views.Item_Read_List]: READ | HAS_GROUP,
    [views.Group_Create]: CREATE,
    [views.Group_Update]: UPDATE,
    [views.Group_Delete]: DELETE,
    [views.Group_Read_List]: READ,
};

const viewFuncs = {
    isCreate: (view) => !!(flags[view] & CREATE),
    isRead: (view) => !!(flags[view] & READ),
    isUpdate: (view) => !!(flags[view] & UPDATE),
    isDelete: (view) => !!(flags[view] & DELETE),
    hasGroup: (view) => !!(flags[view] & HAS_GROUP),
    needsGPS: (view) => !!(flags[view] & NEEDS_GPS),
};

export const View = Object.assign({}, views, viewFuncs);
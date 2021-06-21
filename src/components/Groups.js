import { View } from '../utils/View';
import { createItem, readItems, updateItem, deleteItem, moveItemUp, moveItemDown, GROUPS, WAYPOINTS } from '../utils/db';

export const Groups = (props) => {
    const state = {
        // groups
        createGroupStart: handleCreateGroupStart(props.setView),
        createGroupEnd: handleCreateGroupEnd(props.setView, props.setGroups, props.groups),
        readGroup: handleReadGroup(props.setView, props.setGroupIndex),
        readGroupList: handleReadGroupList(props.setView),
        updateGroupStart: handleUpdateGroupStart(props.setView, props.setGroupIndex),
        updateGroupEnd: handleUpdateGroupEnd(props.setView, props.setGroups, props.groups),
        deleteGroupStart: handleDeleteGroupStart(props.setView, props.setGroupIndex),
        deleteGroupEnd: handleDeleteGroupEnd(props.setView, props.setGroups, props.groups),
        moveGroupUp: handleMoveGroupUp(props.setView, props.setGroups, props.groups),
        moveGroupDown: handleMoveGroupDown(props.setView, props.setGroups, props.groups),
        // items
        createItemStart: handleCreateItemStart(props.setView, props.setItemIndex, props.groups, props.groupIndex),
        createItemEnd: handleCreateItemEnd(props.setView, props.setWaypoints, props.groups, props.groupIndex),
        readItem: handleReadItem(props.setView, props.setItemIndex),
        readItemList: handleReadItemList(props.setView),
        updateItemStart: handleUpdateItemStart(props.setView, props.setItemIndex),
        updateItemEnd: handleUpdateItemEnd(props.setView, props.setWaypoints, props.groups, props.groupIndex),
        deleteItemStart: handleDeleteItemStart(props.setView, props.setItemIndex),
        deleteItemEnd: handleDeleteItemEnd(props.setView, props.setWaypoints, props.groups, props.groupIndex),
        moveItemUp: handleMoveItemUp(props.setView, props.setWaypoints, props.groups, props.groupIndex),
        moveItemDown: handleMoveItemDown(props.setView, props.setWaypoints, props.groups, props.groupIndex),
    };
    return props.render({ ...state });
};

// groups
const handleCreateGroupStart = (setView) => () => {
    setView(View.Group_Create);
};
const handleCreateGroupEnd = (setView, setGroups, groups) => async (name) => {
    setView(View.Group_List);
    const item = { name: name };
    setGroups(await createItem(GROUPS, item));
};
const handleReadGroup = (setView, setGroupIndex) => (index) => {
    setView(View.Item_List);
    setGroupIndex(index);
};
const handleReadGroupList = (setView) => () => {
    setView(View.Group_List);
};
const handleUpdateGroupStart = (setView, setGroupIndex) => (index) => {
    setView(View.Group_Update);
    setGroupIndex(index);
};
const handleUpdateGroupEnd = (setView, setGroups, groups) => async (index, name) => {
    setView(View.Group_List);
    const item = Object.assign({}, groups[index], { name: name });
    setGroups(await updateItem(GROUPS, item));
};
const handleDeleteGroupStart = (setView, setGroupIndex) => (index) => {
    setView(View.Group_Delete);
    setGroupIndex(index);
};
const handleDeleteGroupEnd = (setView, setGroups, groups) => async (index) => {
    setView(View.Group_List);
    const item = groups[index];
    setGroups(await deleteItem(GROUPS, item));
};
const handleMoveGroupUp = (setView, setGroups, groups) => async (index) => {
    setView(View.Group_List);
    const item = groups[index];
    setGroups(await moveItemUp(GROUPS, item));
};
const handleMoveGroupDown = (setView, setGroups, groups) => async (index) => {
    setView(View.Group_List);
    const item = groups[index];
    setGroups(await moveItemDown(GROUPS, item));
};

// items
// TODO: provide items instead of groups
const handleCreateItemStart = (setView, setItemIndex, groups, groupIndex) => async () => {
    setView(View.Item_Create);
    const groupKey = groups[groupIndex].key;
    const waypoints = await readItems(WAYPOINTS, groupKey);
    setItemIndex(waypoints.length);
};
const handleCreateItemEnd = (setView, setWaypoints, groups, groupIndex) => async (name, lat, lng) => {
    setView(View.Item_Read);
    const groupKey = groups[groupIndex].key;
    const item = {
        name: name,
        lat: lat,
        lng: lng,
        parentKey: groupKey,
    };
    setWaypoints(await createItem(WAYPOINTS, item));
};
const handleReadItem = (setView, setItemIndex) => (index) => {
    setView(View.Item_Read);
    setItemIndex(index);
};
const handleReadItemList = (setView) => () => {
    setView(View.Item_List);
};
const handleUpdateItemStart = (setView, setItemIndex) => (index) => {
    setView(View.Item_Update);
    setItemIndex(index);
};
const handleUpdateItemEnd = (setView, setWaypoints, groups, groupIndex) => async (index, name, lat, lng) => {
    setView(View.Item_Read);
    const group = groups[groupIndex];
    const waypoints = await readItems(WAYPOINTS, group.key);
    const waypoint = Object.assign({}, waypoints[index], {
        name: name,
        lat: lat,
        lng: lng,
    });
    setWaypoints(await updateItem(WAYPOINTS, waypoint));
};
const handleDeleteItemStart = (setView, setItemIndex) => (index) => {
    setView(View.Item_Delete);
    setItemIndex(index);
};
const handleDeleteItemEnd = (setView, setWaypoints, groups, groupIndex) => async (index) => {
    setView(View.Item_List);
    const group = groups[groupIndex];
    const waypoints = await readItems(WAYPOINTS, group.key);
    const waypoint = waypoints[index];
    setWaypoints(await deleteItem(WAYPOINTS, waypoint));
};
const handleMoveItemUp = (setView, setWaypoints, groups, groupIndex) => async (index) => {
    setView(View.Item_List);
    const group = groups[groupIndex];
    const waypoints = await readItems(WAYPOINTS, group.key);
    const waypoint = waypoints[index];
    setWaypoints(await moveItemUp(WAYPOINTS, waypoint));
};
const handleMoveItemDown = (setView, setWaypoints, groups, groupIndex) => async (index) => {
    setView(View.Item_List);
    const group = groups[groupIndex];
    const waypoints = await readItems(WAYPOINTS, group.key);
    const waypoint = waypoints[index];
    setWaypoints(await moveItemDown(WAYPOINTS, waypoint));
};
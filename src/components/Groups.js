import { View } from '../utils/View';
import { Groups as GroupUtils } from '../utils/Groups';

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
        createItemEnd: handleCreateItemEnd(props.setView, props.setGroups, props.groups, props.groupIndex),
        readItem: handleReadItem(props.setView, props.setItemIndex),
        readItemList: handleReadItemList(props.setView),
        updateItemStart: handleUpdateItemStart(props.setView, props.setItemIndex),
        updateItemEnd: handleUpdateItemEnd(props.setView, props.setGroups, props.groups, props.groupIndex),
        deleteItemStart: handleDeleteItemStart(props.setView, props.setItemIndex),
        deleteItemEnd: handleDeleteItemEnd(props.setView, props.setGroups, props.groups, props.groupIndex),
        moveItemUp: handleMoveItemUp(props.setView, props.setGroups, props.groups, props.groupIndex),
        moveItemDown: handleMoveItemDown(props.setView, props.setGroups, props.groups, props.groupIndex),
    };
    return props.render({ ...state });
};

// groups
const handleCreateGroupStart = (setView) => () => {
    setView(View.Group_Create);
};
const handleCreateGroupEnd = (setView, setGroups, groups) => (name) => {
    setView(View.Group_List);
    setGroups(GroupUtils.createGroup(groups, name));
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
const handleUpdateGroupEnd = (setView, setGroups, groups) => (index, name) => {
    setView(View.Group_List);
    setGroups(GroupUtils.updateGroup(groups, index, name));
};
const handleDeleteGroupStart = (setView, setGroupIndex) => (index) => {
    setView(View.Group_Delete);
    setGroupIndex(index);
};
const handleDeleteGroupEnd = (setView, setGroups, groups) => (index) => {
    setView(View.Group_List);
    setGroups(GroupUtils.deleteGroup(groups, index));
};
const handleMoveGroupUp = (setView, setGroups, groups) => (index) => {
    setView(View.Group_List);
    setGroups(GroupUtils.moveGroupUp(groups, index));
};
const handleMoveGroupDown = (setView, setGroups, groups) => (index) => {
    setView(View.Group_List);
    setGroups(GroupUtils.moveGroupDown(groups, index));
};

// items
const handleCreateItemStart = (setView, setItemIndex, groups, groupIndex) => () => {
    setView(View.Item_Create);
    setItemIndex(groups[groupIndex].items.length);
};
const handleCreateItemEnd = (setView, setGroups, groups, groupIndex) => (name, lat, lng) => {
    setView(View.Item_Read);
    setGroups(GroupUtils.createItem(groups, groupIndex, name, lat, lng));
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
const handleUpdateItemEnd = (setView, setGroups, groups, groupIndex) => (index, name, lat, lng) => {
    setView(View.Item_Read);
    setGroups(GroupUtils.updateItem(groups, groupIndex, index, name, lat, lng));
};
const handleDeleteItemStart = (setView, setItemIndex) => (index) => {
    setView(View.Item_Delete);
    setItemIndex(index);
};
const handleDeleteItemEnd = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Item_List);
    setGroups(GroupUtils.deleteItem(groups, groupIndex, index));
};
const handleMoveItemUp = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Item_List);
    setGroups(GroupUtils.moveItemUp(groups, groupIndex, index));
};
const handleMoveItemDown = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Item_List);
    setGroups(GroupUtils.moveItemDown(groups, groupIndex, index));
};
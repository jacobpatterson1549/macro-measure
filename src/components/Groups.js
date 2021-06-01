import { View } from '../utils/View';
import { Groups as GroupUtils } from '../utils/Groups';

// GroupsView contains the groups and functions to change them
export const Groups = ({ groups, groupIndex, setView, setGroups, setGroupIndex, setItemIndex, render }) => {
    const props = {
        // groups
        createGroupStart: handleCreateGroupStart(setView),
        createGroupEnd: handleCreateGroupEnd(setView, setGroups, groups),
        readGroup: handleReadGroup(setView, setGroupIndex),
        readGroups: handleReadGroups(setView),
        updateGroupStart: handleUpdateGroupStart(setView, setGroupIndex),
        updateGroupEnd: handleUpdateGroupEnd(setView, setGroups, groups),
        deleteGroupStart: handleDeleteGroupStart(setView, setGroupIndex),
        deleteGroupEnd: handleDeleteGroupEnd(setView, setGroups, groups),
        moveGroupUp: handleMoveGroupUp(setView, setGroups, groups),
        moveGroupDown: handleMoveGroupDown(setView, setGroups, groups),
        // items
        createItemStart: handleCreateItemStart(setView, setItemIndex, groups, groupIndex),
        createItemEnd: handleCreateItemEnd(setView, setGroups, groups, groupIndex),
        readItem: handleReadItem(setView, setItemIndex),
        readItems: handleReadItems(setView),
        updateItemStart: handleUpdateItemStart(setView, setItemIndex),
        updateItemEnd: handleUpdateItemEnd(setView, setGroups, groups, groupIndex),
        deleteItemStart: handleDeleteItemStart(setView, setItemIndex),
        deleteItemEnd: handleDeleteItemEnd(setView, setGroups, groups, groupIndex),
        moveItemUp: handleMoveItemUp(setView, setGroups, groups, groupIndex),
        moveItemDown: handleMoveItemDown(setView, setGroups, groups, groupIndex),
    };
    return render(props);
};

// groups
const handleCreateGroupStart = (setView) => () => {
    setView(View.Group_Create);
};
const handleCreateGroupEnd = (setView, setGroups, groups) => (name) => {
    setView(View.Groups_Read);
    setGroups(GroupUtils.createGroup(groups, name));
};
const handleReadGroup = (setView, setGroupIndex) => (index) => {
    setView(View.Items_Read);
    setGroupIndex(index);
};
const handleReadGroups = (setView) => () => {
    setView(View.Groups_Read);
};
const handleUpdateGroupStart = (setView, setGroupIndex) => (index) => {
    setView(View.Group_Update);
    setGroupIndex(index);
};
const handleUpdateGroupEnd = (setView, setGroups, groups) => (index, name) => {
    setView(View.Groups_Read);
    setGroups(GroupUtils.updateGroup(groups, index, name));
};
const handleDeleteGroupStart = (setView, setGroupIndex) => (index) => {
    setView(View.Group_Delete);
    setGroupIndex(index);
};
const handleDeleteGroupEnd = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
    setGroups(GroupUtils.deleteGroup(groups, index));
};
const handleMoveGroupUp = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
    setGroups(GroupUtils.moveGroupUp(groups, index));
};
const handleMoveGroupDown = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
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
const handleReadItems = (setView) => () => {
    setView(View.Items_Read);
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
    setView(View.Items_Read);
    setGroups(GroupUtils.deleteItem(groups, groupIndex, index));
};
const handleMoveItemUp = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Items_Read);
    setGroups(GroupUtils.moveItemUp(groups, groupIndex, index));
};
const handleMoveItemDown = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Items_Read);
    setGroups(GroupUtils.moveItemDown(groups, groupIndex, index));
};
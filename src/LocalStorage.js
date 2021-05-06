/* structure:
  * 
  * "currentGroup"   : "string"
  * currentGroupItem : "string"
  * "distanceUnit"   : "string"
  * "groups" : {
  *   "groupName" : [
  *         {
  *           "itemName"  : "string",
  *           "latitude"  : "string",
  *           "longitude" : "string"
  *         },
  *         ...
  *       ],
  *     ...
  *   ]
  * }
  */
class LocalStorage {

  static _current_group_key = 'currentGroup';
  static _current_group_item_key = 'currentGroupItem';
  static _groups_key = 'groups';
  static _distance_unit_key = 'distanceUnit';

  constructor(storage) {
    // window.localStorage
    this.storage = storage;
  }

  clear() {
    this.storage.clear()
  }

  getDistanceUnit() {
    // TODO: also return ratio?
    return this.storage.getItem(LocalStorage._distance_unit_key);
  }
  setDistanceUnit(unit) {
    this.storage.setItem(LocalStorage._distance_unit_key, unit);
  }

  getCurrentGroup() {
    return this.storage.getItem(LocalStorage._current_group_key);
  }
  setCurrentGroup(name) {
    this.storage.setItem(LocalStorage._current_group_key, name);
  }

  getCurrentGroupItem() {
    return this.storage.getItem(LocalStorage._current_group_item_key);
  }
  setCurrentGroupItem(name) {
    this.storage.setItem(LocalStorage._current_group_item_key, name);
  }

  createGroup(name) {
    var groups = this.getGroups() || {};
    groups[name] = [];
    this._setGroups(groups);
  }
  getGroups() {
    var groupsJSON = this.storage.getItem(LocalStorage._groups_key);
    return JSON.parse(groupsJSON) || {};
  }
  updateGroup(oldName, newName) {
    var groups = this.getGroups();
    var oldGroup = groups[oldName] || null;
    delete groups[oldName];
    groups[newName] = oldGroup;
    this._setGroups(groups);
  }
  _setGroups(groups) {
    var groupsJSON = JSON.stringify(groups);
    this.storage.setItem(LocalStorage._groups_key, groupsJSON);
  }
  deleteGroup(name) {
    var groups = this.getGroups();
    delete groups[name];
    this._setGroups(groups);
  }

  createGroupItem(groupName, name, latitude, longitude) {
    var groups = this.getGroups();
    var groupItem = {
      "name": name,
      "x": String(latitude),
      "y": String(longitude),
    }
    if (groups[groupName]) {
      groups[groupName].push(groupItem);
      this._setGroups(groups);
    }
  }
  getGroupItems(groupName) {
    var groups = this.getGroups();
    return groups[groupName] || [];
  }
  updateGroupItem(groupName, oldName, newName) {
    var groups = this.getGroups();
    var items = groups[groupName];
    var item = items.find(item => item.name == oldName);
    if (item != null) {
      item.name = newName;
      this._setGroups(groups)
    }
  }
  moveGroupItemUp(groupName, name) {
    this._moveGroupItem(groupName, name, -1);
  }
  moveGroupItemDown(groupName, name) {
    this._moveGroupItem(groupName, name, +1);
  }
  _moveGroupItem(groupName, name, delta) {
    var groups = this.getGroups();
    var items = groups[groupName];
    var itemIndex = items.findIndex(item => item.name == name);
    if (itemIndex+delta >= 0 && itemIndex+delta < items.length) {
      var tmpItem = items[itemIndex];
      items[itemIndex] = items[itemIndex+delta];
      items[itemIndex+delta] = tmpItem;
      this._setGroups(groups)
    }
  }
  deleteGroupItem(groupName, name) {
    var groups = this.getGroups();
    var items = groups[groupName];
    var itemIndex = items.findIndex(item => item.name == name);
    if (itemIndex >= 0) {
      items.splice(itemIndex, 1);
      this._setGroups(groups);
    }
  }
}

export default LocalStorage
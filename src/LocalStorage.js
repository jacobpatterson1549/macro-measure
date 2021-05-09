/* structure:
  * 
  * "currentGroup": "string"
  * "currentGroupItem": "string"
  * "distanceUnit": "string"
  * "groups" : [
  *   {
  *     "name": "string"
  *     "items": [
  *         {
  *           "name"  : "string",
  *           "lat"  : "string",
  *           "lng" : "string"
  *         },
  *         ...
  *       ]
  *   },
  *   ...
  * ]
  */
export class LocalStorage {

  static _view_key = 'view';
  static _distance_unit_key = 'distanceUnit';
  static _current_group_key = 'currentGroup';
  static _current_group_item_key = 'currentGroupItem';
  static _groups_key = 'groups';

  constructor(storage) {
    this.storage = storage;
  }

  clear() {
    this.storage.clear()
  }

  getView() {
    return this.storage.getItem(LocalStorage._view_key);
  }
  setView(view) {
    this.storage.setItem(LocalStorage._view_key, view);
  }

  getDistanceUnit() {
    // TODO: also return ratio?
    return this.storage.getItem(LocalStorage._distance_unit_key);
  }
  setDistanceUnit(unit) {
    this.storage.setItem(LocalStorage._distance_unit_key, unit);
  }

  getCurrentGroup() {
    return this.storage.getItem(LocalStorage._current_group_key) || null;
  }
  setCurrentGroup(name) {
    this.storage.setItem(LocalStorage._current_group_key, name);
  }

  getCurrentGroupItem() {
    return this.storage.getItem(LocalStorage._current_group_item_key) || null;
  }
  setCurrentGroupItem(name) {
    this.storage.setItem(LocalStorage._current_group_item_key, name);
  }

  createGroup(name) {
    const groups = this.deleteGroup(name);
    const group = {
      name: name,
      items: []
    };
    groups.push(group);
    this._setGroups(groups);
    return groups;
  }
  getGroups() {
    const groupsJSON = this.storage.getItem(LocalStorage._groups_key) || null;
    return JSON.parse(groupsJSON) || [];
  }
  updateGroup(oldName, newName) {
    const groups = this.getGroups();
    const group = groups.find((group) => group.name === oldName);
    if (group) {
      group.name = newName;
      this._setGroups(groups);
    }
    return groups;
  }
  moveGroupUp(name) {
    return this._moveGroup(name, -1);
  }
  moveGroupDown(name) {
    return this._moveGroup(name, +1);
  }
  _moveGroup(name, delta) {
    const groups = this.getGroups();
    const index = groups.findIndex((group) => group.name === name);
    if (index + delta >= 0 && index + delta < groups.length) {
      const tmp = groups[index];
      groups[index] = groups[index + delta];
      groups[index + delta] = tmp;
      this._setGroups(groups)
    }
    return groups;
  }
  _setGroups(groups) {
    const groupsJSON = JSON.stringify(groups);
    this.storage.setItem(LocalStorage._groups_key, groupsJSON);
  }
  deleteGroup(name) {
    const groups = this.getGroups();
    const index = groups.findIndex((group) => group.name === name);
    if (index >= 0) {
      groups.splice(index, 1);
      this._setGroups(groups);
    }
    return groups;
  }

  createGroupItem(groupName, name, latitude, longitude) {
    const groups = this.getGroups();
    const group = groups.find((group) => group.name === groupName);
    if (group) {
      const items = group.items;
      const item = {
        "name": name,
        "lat": String(latitude),
        "lng": String(longitude),
      };
      items.push(item);
      this._setGroups(groups);
    }
  }
  getGroupItems(groupName) {
    const groups = this.getGroups();
    const group = groups.find((group) => group.name === groupName);
    if (group) {
      return group.items;
    }
    return [];
  }
  updateGroupItem(groupName, oldName, newName, newLat, newLng) {
    const groups = this.getGroups();
    const group = groups.find((group) => group.name === groupName);
    if (group) {
      const items = group.items;
      const item = items.find((item) => item.name === oldName);
      if (item != null) {
        item.name = newName;
        item.lat = String(newLat);
        item.lng = String(newLng);
        this._setGroups(groups)
      }
    }
    return groups;
  }
  moveGroupItemUp(groupName, name) {
    return this._moveGroupItem(groupName, name, -1);
  }
  moveGroupItemDown(groupName, name) {
    return this._moveGroupItem(groupName, name, +1);
  }
  _moveGroupItem(groupName, name, delta) {
    const groups = this.getGroups();
    const group = groups.find((group) => group.name === groupName);
    if (group) {
      const items = group.items;
      const index = items.findIndex((item) => item.name === name);
      if (index + delta >= 0 && index + delta < items.length) {
        const tmp = items[index];
        items[index] = items[index + delta];
        items[index + delta] = tmp;
        this._setGroups(groups)
      }
    }
    return groups
  }
  deleteGroupItem(groupName, name) {
    const groups = this.getGroups();
    const group = groups.find((group) => group.name === groupName);
    if (group) {
      const items = group.items;
      const index = items.findIndex((item) => item.name === name);
      if (index >= 0) {
        items.splice(index, 1);
        this._setGroups(groups);
      }
    }
    return groups;
  }
}
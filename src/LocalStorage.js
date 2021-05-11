/* structure:
  * 
  * "currentGroupIndex": "integer"
  * "currentItemIndex": "integer"
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
  static _current_group_index_key = 'currentGroupIndex';
  static _current_item_index_key = 'currentItemIndex';
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
    return this.storage.getItem(LocalStorage._distance_unit_key);
  }
  setDistanceUnit(unit) {
    this.storage.setItem(LocalStorage._distance_unit_key, unit);
  }

  getCurrentGroupIndex() {
    const index = this.storage.getItem(LocalStorage._current_group_index_key);
    return index ? parseInt(index) : -1;
  }
  setCurrentGroupIndex(index) {
    this.storage.setItem(LocalStorage._current_group_index_key, index);
  }

  getCurrentItemIndex() {
    const index = this.storage.getItem(LocalStorage._current_item_index_key);
    return index ? parseInt(index) : -1;
  }
  setCurrentItemIndex(index) {
    this.storage.setItem(LocalStorage._current_item_index_key, index);
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
  updateGroup(index, name) {
    const groups = this.getGroups();
    if (index >= 0 && index < groups.length) {
      const group = groups[index];
      group.name = name;
      this._setGroups(groups);
    }
    return groups;
  }
  moveGroupUp(index) {
    return this._moveGroup(index, -1);
  }
  moveGroupDown(index) {
    return this._moveGroup(index, +1);
  }
  _moveGroup(index, delta) {
    // TODO: use slice? (when mutating state directly)
    const groups = this.getGroups();
    if (index >= 0 && index < groups.length && index + delta >= 0 && index + delta < groups.length) {
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
  deleteGroup(index) {
    const groups = this.getGroups();
    if (index >= 0 && index < groups.length) {
      groups.splice(index, 1);
      this._setGroups(groups);
    }
    return groups;
  }

  createItem(groupIndex, name, latitude, longitude) {
    const groups = this.getGroups();
    if (groupIndex >= 0 && groupIndex < groups.length) {
      const group = groups[groupIndex];
      const items = group.items;
      const item = {
        "name": name,
        "lat": latitude,
        "lng": longitude,
      };
      items.push(item);
      this._setGroups(groups);
    }
  }
  updateItem(groupIndex, index, name, lat, lng) {
    const groups = this.getGroups();
    if (groupIndex >= 0 && groupIndex < groups.length) {
      const group = groups[groupIndex];
      const items = group.items;
      if (index >= 0 && index < items.length) {
        const item = items[index]
        item.name = name;
        item.lat = lat;
        item.lng = lng;
        this._setGroups(groups)
      }
    }
    return groups;
  }
  moveItemUp(groupIndex, index) {
    return this._moveItem(groupIndex, index, -1);
  }
  moveItemDown(groupIndex, index) {
    return this._moveItem(groupIndex, index, +1);
  }
  _moveItem(groupIndex, index, delta) {
    const groups = this.getGroups();
    if (groupIndex >= 0 && groupIndex < groups.length) {
      const group = groups[groupIndex];
      const items = group.items;
      if (index >= 0 && index < items.length && index + delta >= 0 && index + delta < items.length) {
        const tmp = items[index];
        items[index] = items[index + delta];
        items[index + delta] = tmp;
        this._setGroups(groups)
      }
    }
    return groups
  }
  deleteItem(groupIndex, index) {
    const groups = this.getGroups();
    if (groupIndex >= 0 && groupIndex < groups.length) {
      const group = groups[groupIndex];
      const items = group.items;
      if (index >= 0 && index < items.length) {
        items.splice(index, 1);
        this._setGroups(groups);
      }
    }
    return groups;
  }
}
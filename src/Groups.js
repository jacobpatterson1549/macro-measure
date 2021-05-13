// groups performs actions on groups, returning new references when modified
export const Groups = {
  createGroup: (groups, name) => {
    groups = deepCopy(groups);
    const group = {
      name: name,
      items: [],
    };
    groups.push(group);
    return groups;
  },
  updateGroup: (groups, index, name) => {
    if (index >= 0 && index < groups.length) {
      groups = deepCopy(groups);
      const group = groups[index];
      group.name = name;
    }
    return groups;
  },
  moveGroupUp: (groups, index) => {
    return Groups._moveGroup(groups, index, -1);
  },
  moveGroupDown: (groups, index) => {
    return Groups._moveGroup(groups, index, +1);
  },
  _moveGroup: (groups, index, delta) => {
    if (index >= 0 && index < groups.length && index + delta >= 0 && index + delta < groups.length) {
      groups = deepCopy(groups);
      const tmp = groups[index];
      groups[index] = groups[index + delta];
      groups[index + delta] = tmp;
    }
    return groups;
  },
  deleteGroup:(groups, index) => {
    if (index >= 0 && index < groups.length) {
      groups = deepCopy(groups);
      groups.splice(index, 1);
    }
    return groups;
  },

  createItem: (groups, groupIndex, name, lat, lng) => {
    if (groupIndex >= 0 && groupIndex < groups.length) {
      groups = deepCopy(groups);
      const group = groups[groupIndex];
      const items = group.items;
      const item = {
        "name": name,
        "lat": lat,
        "lng": lng,
      };
      items.push(item);
    }
    return groups;
  },
  updateItem: (groups, groupIndex, index, name, lat, lng) => {
    if (groupIndex >= 0 && groupIndex < groups.length) {
      groups = deepCopy(groups);
      const group = groups[groupIndex];
      const items = group.items;
      if (index >= 0 && index < items.length) {
        const item = items[index];
        item.name = name;
        item.lat = lat;
        item.lng = lng;
      }
    }
    return groups;
  },
  moveItemUp: (groups, groupIndex, index) => {
    return Groups._moveItem(groups, groupIndex, index, -1);
  },
  moveItemDown: (groups, groupIndex, index) => {
    return Groups._moveItem(groups, groupIndex, index, +1);
  },
  _moveItem: (groups, groupIndex, index, delta) => {
    if (groupIndex >= 0 && groupIndex < groups.length) {
      groups = deepCopy(groups);
      const group = groups[groupIndex];
      const items = group.items;
      if (index >= 0 && index < items.length && index + delta >= 0 && index + delta < items.length) {
        const tmp = items[index];
        items[index] = items[index + delta];
        items[index + delta] = tmp;
      }
    }
    return groups;
  },
  deleteItem: (groups, groupIndex, index) => {
    if (groupIndex >= 0 && groupIndex < groups.length) {
      groups = deepCopy(groups);
      const group = groups[groupIndex];
      const items = group.items;
      if (index >= 0 && index < items.length) {
        items.splice(index, 1);
      }
    }
    return groups;
  },
};

// TODO: use better deep copy
const deepCopy = (groups) => JSON.parse(JSON.stringify(groups));
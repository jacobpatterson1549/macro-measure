import { flags } from './View';

export const Crud = {
    createItem: (items, item, filter) => {
        items = deepCopy(items);
        const index = items.reduce(
            (maxIndex, item, index) => (
                (filter?.(item)) ? index : maxIndex), // max index of item that matches filter
            items.length); // default index to end
        items.splice(index + 1, 0, item); // + 1 to insert after index
        return items;
    },

    readItems: (items, filter) => {
        return (filter) ? items.filter(filter) : items;
    },

    updateItem: (items, index, item) => {
        if (index >= 0 && index < items.length) {
            items = deepCopy(items);
            items[index] = item
        }
        return items;
    },

    moveItemUp: (items, index) => {
        return moveItem(items, index, -1);
    },

    moveItemDown: (items, index) => {
        return moveItem(items, index, +1);
    },

    deleteItem: (items, index) => {
        if (index >= 0 && index < items.length) {
            items = deepCopy(items);
            items.splice(index, 1);
        }
        return items;
    },

    deleteItems: (items, filter) => {
        return items.filter((item) => (!filter(item))); // remove all items that MATCH the filter
    },
};

const moveItem = (items, index, delta) => {
    if (index >= 0 && index < items.length && index + delta >= 0 && index + delta < items.length) {
        items = deepCopy(items);
        const tmp = items[index];
        items[index] = items[index + delta];
        items[index + delta] = tmp;
    }
    return items;
};

const deepCopy = (items) => (
    JSON.parse(JSON.stringify(items))
);
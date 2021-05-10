import React from 'react';

import { About } from './About';
import { Help } from './Help';
import { Settings } from './Settings';
import { GroupList } from './GroupList';
import { ItemList } from './ItemList';
import { Item } from './Item';

export const DefaultView = 'groups';

const render = (props) => {
    switch (props.view) {
        case 'about':
            return (<About />);
        case 'help':
            return (<Help />);
        case 'settings':
            return (<Settings
                distanceUnit={props.distanceUnit}
                setDistanceUnit={props.setDistanceUnit}
                clearStorage={props.clearStorage}
            />);
        case 'items':
            return (<ItemList
                items={props.items}
                createStart={props.createItemStart}
                read={props.readItem}
                updateStart={props.updateItemStart}
                delete={props.deleteItem}
                move={props.moveItemUp}
                moveDown={props.moveItemDown}
            />);
        case 'item-create':
        case 'item-read':
        case 'item-update':
            return (<Item
                item={props.item}
                create={props.createItemEnd}
                update={props.updateItemEnd}
                index={props.itemIndex}
                count={props.items.length}
                distanceUnit={props.distanceUnit}
            />);
        case 'groups':
        default:
            return (<GroupList
                groups={props.groups}
                create={props.createGroup}
                read={props.readGroup}
                update={props.updateGroup}
                delete={props.deleteGroup}
                moveUp={props.moveGroupUp}
                moveDown={props.moveGroupDown}
            />);
    }
}

export const Main = (props) => (
    <main className="Main">
        {render(props)}
    </main>
);
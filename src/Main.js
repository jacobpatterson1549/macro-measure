import React from 'react';

import { About } from './About';
import { Help } from './Help';
import { Settings } from './Settings';
import { GroupList } from './GroupList';
import { ItemList } from './ItemList';

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
                setDistanceUnit={unit => props.setDistanceUnit(unit)}
                clearStorage={() => props.clearStorage()}
            />);
        case 'items':
            return (<ItemList
                currentGroup={props.currentGroup}
            />);
        default:
            return (<GroupList
                groups={props.groups}
                createGroup={props.createGroup}
                readGroup={props.readGroup}
                updateGroup={props.updateGroup}
                deleteGroup={props.deleteGroup}
                moveGroupUp={props.moveGroupUp}
                moveGroupDown={props.moveGroupDown}
            />);
    }
}

export const Main = (props) => (
    <main className="Main">
        {render(props)}
    </main>
);
import React from 'react';

import About from './About';
import Help from './Help';
import Settings from './Settings';
import { GroupList } from './GroupList';
import { ItemList } from './ItemList';

export default class Main extends React.Component {

    static DefaultView = 'groups';

    renderView() {
        switch (this.props.view) {
            case 'about':
                return (<About />);
            case 'help':
                return (<Help />);
            case 'settings':
                return (<Settings
                    distanceUnit={this.props.distanceUnit}
                    setDistanceUnit={unit => this.props.setDistanceUnit(unit)}
                    clearStorage={() => this.props.clearStorage()}
                />);
            case 'items':
                return (<ItemList
                    currentGroup={this.props.currentGroup}
                />);
            default:
                return (<GroupList
                    groups={this.props.groups}
                    createGroup={this.props.createGroup}
                    readGroup={this.props.readGroup}
                    updateGroup={this.props.updateGroup}
                    deleteGroup={this.props.deleteGroup}
                    moveGroupUp={this.props.moveGroupUp}
                    moveGroupDown={this.props.moveGroupDown}
                />);
        }
    }

    render() {
        return (
            <main className="Main">
                {this.renderView()}
            </main>
        );
    }
}
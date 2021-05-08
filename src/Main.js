import React from 'react';
import About from './About';
import Help from './Help';
import Groups from './Groups';
import Items from './Items';
import Settings from './Settings';

class Main extends React.Component {

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
                return (<Items
                    currentGroup={this.props.currentGroup}
                    distanceUnit={this.props.distanceUnit}
                />);
            default:
                return (<Groups
                    groups={this.props.groups}
                    currentGroup={this.props.currentGroup}
                    currentGroupItem={this.props.currentGroupItem}
                    setCurrentGroup={name => this.props.setCurrentGroup(name)}
                    createGroup={name => this.props.createGroup(name)}
                    renameGroup={(oldName, newName) => this.props.renameGroup(oldName, newName)}
                    moveGroupUp={name => this.props.moveGroupUp(name)}
                    moveGroupDown={name => this.props.moveGroupDown(name)}
                    deleteGroup={name => this.props.deleteGroup(name)}
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

export default Main;
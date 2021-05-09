import React from 'react';

import './App.css';
import { LocalStorage } from './LocalStorage';
import { Header } from './Header';
import { Main } from './Main';
import { Settings } from './Settings';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    const storage = window.localStorage;
    this.localStorage = new LocalStorage(storage);

    this.state = {
      view: this.localStorage.getView() || Main.DefaultView,
      groups: this.localStorage.getGroups(),
      currentGroup: this.localStorage.getCurrentGroup(),
      currentGroupItem: this.localStorage.getCurrentGroupItem(),
      distanceUnit: this.localStorage.getDistanceUnit() || Settings.DefaultDistanceUnit
    };
  }

  setView(view) {
    this.localStorage.setView(view);
    this.setState({ view: view });
  }

  setDistanceUnit(distanceUnit) {
    this.localStorage.setDistanceUnit(distanceUnit);
    this.setState({ distanceUnit: distanceUnit });
  }

  setCurrentGroup(name) {
    this.localStorage.setCurrentGroup(name);
    this.setState({
      view: "items",
      currentGroup: name
    });
  }

  createGroup(name) {
    const groups = this.localStorage.createGroup(name);
    this.setState({
      currentGroup: name,
      view: "items",
      groups: groups
    });
  }

  renameGroup(oldName, newName) {
    const groups = this.localStorage.updateGroup(oldName, newName);
    this.setState({ groups: groups });
  }

  moveGroupUp(name) {
    const groups = this.localStorage.moveGroupUp(name);
    this.setState({ groups: groups });
  }

  moveGroupDown(name) {
    const groups = this.localStorage.moveGroupDown(name);
    this.setState({ groups: groups });
  }

  deleteGroup(name) {
    const groups = this.localStorage.deleteGroup(name);
    this.setState({ groups: groups });
  }

  clearStorage() {
    this.localStorage.clear();
    this.setState({
      view: Main.DefaultView,
      groups: [],
      currentGroup: null,
      currentGroupItem: null,
      distanceUnit: Settings.DefaultDistanceUnit
    });
  }

  render() {
    return (
      <div className="App">
        <Header
          currentGroup={this.state.currentGroup}
          view={this.state.view}
          setView={view => this.setView(view)}
        />
        <Main
          view={this.state.view}
          groups={this.state.groups}
          currentGroup={this.state.currentGroup}
          currentGroupItem={this.state.currentGroupItem}
          distanceUnit={this.state.distanceUnit}
          // groupList
          createGroup={name => this.createGroup(name)}
          readGroup={name => this.setCurrentGroup(name)}
          updateGroup={(oldName, newName) => this.renameGroup(oldName, newName)}
          moveGroupUp={name => this.moveGroupUp(name)}
          moveGroupDown={name => this.moveGroupDown(name)}
          deleteGroup={name => this.deleteGroup(name)}
          // settings
          setDistanceUnit={unit => this.setDistanceUnit(unit)}
          clearStorage={() => this.clearStorage()}
        />
      </div>
    );
  }
}
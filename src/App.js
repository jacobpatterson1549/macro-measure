import React from 'react';

import './App.css';
import { LocalStorage } from './LocalStorage';
import { Header } from './Header';
import { Main, DefaultView } from './Main';
import { Settings, DefaultDistanceUnit } from './Settings';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    const storage = window.localStorage;
    this.localStorage = new LocalStorage(storage);

    const view = this.localStorage.getView();
    const distanceUnit = this.localStorage.getDistanceUnit();
    const currentGroupIndex = this.localStorage.getCurrentGroupIndex();
    const currentItemIndex = this.localStorage.getCurrentItemIndex();
    const groups = this.localStorage.getGroups();
    this.state = {
      view: view || DefaultView,
      distanceUnit: distanceUnit || DefaultDistanceUnit,
      currentGroupIndex: currentGroupIndex,
      currentItemIndex: currentItemIndex,
      groups: groups
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

  createGroup(name) {
    const groups = this.localStorage.createGroup(name);
    this.localStorage.setCurrentGroupIndex(groups.length - 1);
    this.localStorage.setView('items');
    this.setState({
      currentGroupIndex: groups.length - 1,
      view: 'items',
      groups: groups
    });
  }

  readGroup(index) {
    this.localStorage.setCurrentGroupIndex(index);
    this.localStorage.setView('items');
    this.setState({
      view: 'items',
      currentGroupIndex: index
    });
  }

  updateGroup(index, name) {
    const groups = this.localStorage.updateGroup(index, name);
    this.setState({ groups: groups });
  }

  deleteGroup(index) {
    const groups = this.localStorage.deleteGroup(index);
    this.setState({ groups: groups });
  }

  moveGroupUp(index) {
    const groups = this.localStorage.moveGroupUp(index);
    this.setState({ groups: groups });
  }

  moveGroupDown(index) {
    const groups = this.localStorage.moveGroupDown(index);
    this.setState({ groups: groups });
  }

  createItemStart() {
    this.localStorage.setView('item-create');
    this.setState({
      view: 'item-create',
      currentItemIndex: this.state.groups[this.state.currentGroupIndex].items.length,
    });
  }

  createItem(name, lat, lng) {
    const groups = this.localStorage.createItem(this.state.currentGroupIndex, name, lat, lng);
    this.setState({
      groups: groups
    });
  }

  readItem(index) {
    this.localStorage.setView('item-read');
    this.localStorage.setCurrentItemIndex(index);
    this.setState({
      view: 'item-read',
      currentItemIndex: index
    });
  }

  updateItemStart(index) {
    this.localStorage.setView('item-create');
    this.localStorage.setCurrentItemIndex(index);
    this.setState({
      view: 'item-create',
      currentItemIndex: index
    })
  }

  updateItem(index, name, lat, lng) {
    const groups = this.localStorage.updateItem(this.state.currentGroupIndex, index, name, lat, lng);
    this.setState({ groups: groups });
  }

  deleteItem(index) {
    const groups = this.localStorage.deleteItem(this.state.currentGroupIndex, index);
    this.setState({ groups: groups });
  }

  moveItemUp(index) {
    const groups = this.localStorage.moveGroupUp(this.state.currentGroupIndex, index);
    this.setState({
      groups: groups,
      currentItemIndex: this.state.currentItemIndex - 1
    });
  }

  moveItemDown(index) {
    const groups = this.localStorage.moveItemDown(this.state.currentGroupIndex, index);
    this.setState({
      groups: groups,
      currentItemIndex: this.state.currentItemIndex + 1
    });
  }

  clearStorage() {
    this.localStorage.clear();
    this.setState({
      view: Main.DefaultView,
      groups: [],
      currentGroupIndex: 0,
      currentItemIndex: 0,
      distanceUnit: Settings.DefaultDistanceUnit
    });
  }

  currentGroupName() {
    return (this.state.currentGroupIndex >= 0
      && this.state.currentGroupIndex < this.state.groups.length)
      ? this.state.groups[this.state.currentGroupIndex].name
      : '?';
  }

  currentItems() {
    return (this.state.currentGroupIndex >= 0
      && this.state.currentGroupIndex < this.state.groups.length)
      ? this.state.groups[this.state.currentGroupIndex].items
      : [];
  }

  render() {
    return (
      <div className="App">
        <Header
          currentGroupName={this.currentGroupName()}
          view={this.state.view}
          setView={(view) => this.setView(view)}
        />
        <Main
          view={this.state.view}
          // GroupList
          groups={this.state.groups}
          createGroup={(name) => this.createGroup(name)}
          readGroup={(index) => this.readGroup(index)}
          updateGroup={(index, name) => this.updateGroup(index, name)}
          deleteGroup={(index) => this.deleteGroup(index)}
          moveGroupUp={(index) => this.moveGroupUp(index)}
          moveGroupDown={(index) => this.moveGroupDown(index)}
          // ItemList
          items={this.currentItems()}
          createItemStart={() => this.createItemStart()}
          readItem={(index) => this.readItem(index)}
          updateItemStart={(index) => this.updateItemStart(index)}
          deleteItem={(index) => this.deleteItem(index)}
          moveItemUp={(index) => this.moveItemUp(index)}
          moveItemDown={(index) => this.moveItemDown(index)}
          // Item
          // createItemStart
          createItemEnd={(name, lat, lng) => this.createItem(name, lat, lng)}
          // readItem
          itemIndex={this.state.currentItemIndex}
          // updateItemStart
          updateItemEnd={(index, name, lat, lng) => this.updateItem(index, name, lat, lng)}
          distanceUnit={this.state.distanceUnit}
          // Settings
          // distanceUnit
          setDistanceUnit={(unit) => this.setDistanceUnit(unit)}
          clearStorage={() => this.clearStorage()}
        />
      </div>
    );
  }
}
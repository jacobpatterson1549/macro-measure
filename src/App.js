import React from 'react';

import './App.css';
import { LocalStorage } from './LocalStorage';
import { Header } from './Header';
import { Settings, DefaultDistanceUnit } from './Settings';
import { About } from './About';
import { Help } from './Help';
import { NameList } from './NameList'
import { Item } from './Item';

const DefaultView = 'groups';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    const storage = props.storage || window.localStorage;
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
      groups: groups,
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

  createGroupStart(view) {
    this.localStorage.setView(view);
    this.setState({
      view: view,
    })
  }

  createGroupEnd(view, name) {
    const groups = this.localStorage.createGroup(name);
    const index = groups.length - 1;
    this.localStorage.setView(view);
    this.localStorage.setCurrentGroupIndex(index);
    this.setState({
      view: view,
      groups: groups,
      currentGroupIndex: index,
    });
  }

  readGroup(view, index) {
    this.localStorage.setView(view);
    this.localStorage.setCurrentGroupIndex(index);
    this.setState({
      view: view,
      currentGroupIndex: index,
    });
  }

  updateGroupStart(view, index) {
    this.localStorage.setView(view);
    this.localStorage.setCurrentGroupIndex(index);
    this.setState({
      view: view,
      currentGroupIndex: index,
    });
  }

  updateGroupEnd(view, index, name) {
    this.localStorage.setView(view);
    const groups = this.localStorage.updateGroup(index, name);
    this.setState({
      view: view,
      groups: groups,
      currentGroupIndex: index,
    });
  }

  deleteGroupStart(view, index) {
    this.localStorage.setView(view);
    this.localStorage.setCurrentGroupIndex(index);
    this.setState({
      view: view,
      currentGroupIndex: index,
    });
  }

  deleteGroupEnd(view, index) {
    this.localStorage.setView(view);
    const groups = this.localStorage.deleteGroup(index);
    this.setState({
      view: view,
      groups: groups,
      currentGroupIndex: index - 1,
    });
  }

  moveGroupUp(view, index) {
    this.localStorage.setView(view);
    const groups = this.localStorage.moveGroupUp(index);
    this.setState({
      view: view,
      groups: groups,
      currentGroupIndex: index - 1,
    });
  }

  moveGroupDown(view, index) {
    this.localStorage.setView(view);
    const groups = this.localStorage.moveGroupDown(index);
    this.setState({
      view: view,
      groups: groups,
      currentGroupIndex: index + 1,
    });
  }

  createItemStart(view) {
    this.localStorage.setView(view);
    const index = this.state.groups[this.state.currentGroupIndex].items.length;
    this.setState({
      view: view,
      currentItemIndex: index,
    });
  }

  createItemEnd(view, name, lat, lng) {
    this.localStorage.setView(view);
    const index = this.state.groups[this.state.currentGroupIndex].items.length;
    const groups = this.localStorage.createItem(this.state.currentGroupIndex, name, lat, lng);
    this.setState({
      view: view,
      groups: groups,
      currentItemIndex: index,
    });
  }

  readItem(view, index) {
    this.localStorage.setView(view);
    this.localStorage.setCurrentItemIndex(index);
    this.setState({
      view: view,
      currentItemIndex: index,
    });
  }

  updateItemStart(view, index) {
    this.localStorage.setView(view);
    this.localStorage.setCurrentItemIndex(index);
    this.setState({
      view: view,
      currentItemIndex: index,
    })
  }

  updateItemEnd(view, index, name, lat, lng) {
    this.localStorage.setView(view);
    const groups = this.localStorage.updateItem(this.state.currentGroupIndex, index, name, lat, lng);
    this.setState({
      view: view,
      groups: groups,
      currentItemIndex: index,
    });
  }

  deleteItemStart(view, index) {
    this.localStorage.setView(view);
    this.localStorage.setCurrentItemIndex(index);
    this.setState({
      view: view,
      currentItemIndex: index,
    })
  }

  deleteItemEnd(view, index) {
    const groups = this.localStorage.deleteItem(this.state.currentGroupIndex, index);
    this.localStorage.setView(view);
    this.setState({
      view: view,
      groups: groups,
      currentItemIndex: index - 1,
    });
  }

  moveItemUp(view, index) {
    this.localStorage.setView(view);
    const groups = this.localStorage.moveItemUp(this.state.currentGroupIndex, index);
    this.setState({
      view: view,
      groups: groups,
      currentItemIndex: index - 1
    });
  }

  moveItemDown(view, index) {
    this.localStorage.setView(view);
    const groups = this.localStorage.moveItemDown(this.state.currentGroupIndex, index);
    this.setState({
      view: view,
      groups: groups,
      currentItemIndex: index + 1
    });
  }

  clearStorage() {
    this.localStorage.clear();
    this.setState({
      view: DefaultView,
      groups: [],
      currentGroupIndex: 0,
      currentItemIndex: 0,
      distanceUnit: Settings.DefaultDistanceUnit
    });
  }

  currentItems() {
    return (this.state.currentGroupIndex >= 0
      && this.state.currentGroupIndex < this.state.groups.length)
      ? this.state.groups[this.state.currentGroupIndex].items
      : [];
  }

  main() {
    switch (this.state.view) {
      case 'about':
        return (<About />);
      case 'help':
        return (<Help />);
      case 'settings':
        return (<Settings
          distanceUnit={this.state.distanceUnit}
          setDistanceUnit={(unit) => this.setDistanceUnit(unit)}
          clearStorage={() => this.clearStorage()}
        />);
      default:
      case 'group-create':
      case 'groups-read':
      case 'group-update':
      case 'group-delete':
        return (
          <NameList className="GroupList"
            type="group"
            values={this.state.groups}
            index={this.state.currentGroupIndex}
            view={this.state.view}
            createStart={() => this.createGroupStart('group-create')}
            createEnd={(name) => this.createGroupEnd('groups-read', name)}
            read={(index) => this.readGroup('items-read', index)}
            updateStart={(index) => this.updateGroupStart('group-update', index)}
            updateEnd={(index, name) => this.updateGroupEnd('groups-read', index, name)}
            deleteStart={(index) => this.deleteGroupStart('group-delete', index)}
            deleteEnd={(index) => this.deleteGroupEnd('groups-read', index)}
            moveUp={(index) => this.moveGroupUp('groups-read', index)}
            moveDown={(index) => this.moveGroupDown('groups-read', index)}
            cancel={() => this.setView('groups-read')}
          />
        );
      case 'items-read':
        return (
          <NameList className="ItemList"
            type="item"
            values={this.state.groups[this.state.currentGroupIndex].items}
            index={this.state.currentItemIndex}
            view={this.state.view}
            createStart={() => this.createItemStart('item-create')}
            read={(index) => this.readItem('item-read', index)}
            updateStart={(index) => this.updateItemStart('item-update', index)}
            deleteStart={(index) => this.deleteItemStart('item-delete', index)}
            moveUp={(index) => this.moveItemUp('items-read', index)}
            moveDown={(index) => this.moveItemDown('items-read', index)}
          />
        );
      case 'item-create':
      case 'item-read':
      case 'item-update':
      case 'item-delete':
        return (<Item
          view={this.state.view}
          items={this.state.groups[this.state.currentGroupIndex].items}
          index={this.state.currentItemIndex}
          distanceUnit={this.state.distanceUnit}
          createStart={() => this.createItemStart('item-create')}
          createEnd={(name, lat, lng) => this.createItemEnd('item-read', name, lat, lng)}
          read={(index) => this.readItem('item-read', index)}
          readItems={() => this.readGroup('items-read', this.state.currentGroupIndex)}
          updateStart={(index) => this.updateItemStart('item-update', index)}
          updateEnd={(index, name, lat, lng) => this.updateItemEnd('item-read', index, name, lat, lng)}
          deleteStart={(index) => this.deleteItemStart('item-delete', index)}
          deleteEnd={(index) => this.deleteItemEnd('items-read', index)}
        />);
    }
  }

  render() {
    return (
      <div className="App">
        <Header
          view={this.state.view}
          groups={this.state.groups}
          currentGroupIndex={this.state.currentGroupIndex}
          setView={(view) => this.setView(view)}
        />
        <main className="Main">
          {this.main()}
        </main>
      </div>
    );
  }
}
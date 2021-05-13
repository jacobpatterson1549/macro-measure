import React from 'react';

import './App.css';
import { Groups } from './Groups';
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
    this.state = App.loadState(props);
  }

  static loadState(props) {
    const defaultState = {
      view: DefaultView,
      distanceUnit: DefaultDistanceUnit,
      groupIndex: 0,
      itemIndex: 0,
      groups: [],
    }
    const loadState = (key, defaultValue) => (
      props.key || JSON.parse(window.localStorage.getItem(String(key))) || defaultValue
    );
    const state = Object.fromEntries(
      Object.entries(defaultState).map(
        ([key, defaultValue]) => [key, loadState(key, defaultValue)])
    );
    return state;
  }

  setState(props) {
    Object.entries(props).map(([key, value]) =>
      window.localStorage.setItem(String(key), JSON.stringify(value))
    );
    super.setState(props);
  }

  clearStorage() {
    window.localStorage.clear();
    this.setState(App.loadState({}));
  }

  setView(view) {
    this.setState({ view: view });
  }

  setDistanceUnit(distanceUnit) {
    this.setState({ distanceUnit: distanceUnit });
  }

  createGroupStart(view) {
    this.setState({
      view: view,
    })
  }

  createGroupEnd(view, name) {
    this.setState({
      view: view,
      groups: Groups.createGroup(this.state.groups, name),
      groupIndex: this.state.groups.length,
    });
  }

  readGroup(view, index) {
    this.setState({
      view: view,
      groupIndex: index,
    });
  }

  updateGroupStart(view, index) {
    this.setState({
      view: view,
      groupIndex: index,
    });
  }

  updateGroupEnd(view, index, name) {
    this.setState({
      view: view,
      groups: Groups.updateGroup(this.state.groups, index, name),
      groupIndex: index,
    });
  }

  deleteGroupStart(view, index) {
    this.setState({
      view: view,
      groupIndex: index,
    });
  }

  deleteGroupEnd(view, index) {
    this.setState({
      view: view,
      groups: Groups.deleteGroup(this.state.groups, index),
    });
  }

  moveGroupUp(view, index) {
    this.setState({
      view: view,
      groups: Groups.moveGroupUp(this.state.groups, index),
    });
  }

  moveGroupDown(view, index) {
    this.setState({
      view: view,
      groups: Groups.moveGroupDown(this.state.groups, index),
    });
  }

  createItemStart(view) {
    this.setState({
      view: view,
      itemIndex: this.state.groups[this.state.groupIndex].items.length,
    });
  }

  createItemEnd(view, name, lat, lng) {
    this.setState({
      view: view,
      groups: Groups.createItem(this.state.groups, this.state.groupIndex, name, lat, lng),
      itemIndex: this.state.groups[this.state.groupIndex].items.length,
    });
  }

  readItem(view, index) {
    this.setState({
      view: view,
      itemIndex: index,
    });
  }

  updateItemStart(view, index) {
    this.setState({
      view: view,
      itemIndex: index,
    })
  }

  updateItemEnd(view, index, name, lat, lng) {
    this.setState({
      view: view,
      groups: Groups.updateItem(this.state.groups, this.state.groupIndex, index, name, lat, lng),
      itemIndex: index,
    });
  }

  deleteItemStart(view, index) {
    this.setState({
      view: view,
      itemIndex: index,
    })
  }

  deleteItemEnd(view, index) {
    this.setState({
      view: view,
      groups: Groups.deleteItem(this.state.groups, this.state.groupIndex, index),
    });
  }

  moveItemUp(view, index) {
    this.setState({
      view: view,
      groups: Groups.moveItemUp(this.state.groups, this.state.groupIndex, index),
    });
  }

  moveItemDown(view, index) {
    this.setState({
      view: view,
      groups: Groups.moveItemDown(this.state.groups, this.state.groupIndex, index),
    });
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
            index={this.state.groupIndex}
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
            values={this.state.groups[this.state.groupIndex].items}
            index={this.state.itemIndex}
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
      case 'item-no-geo':
        return (<Item
          view={this.state.view}
          items={this.state.groups[this.state.groupIndex].items}
          index={this.state.itemIndex}
          distanceUnit={this.state.distanceUnit}
          createStart={() => this.createItemStart('item-create')}
          createEnd={(name, lat, lng) => this.createItemEnd('item-read', name, lat, lng)}
          read={(index) => this.readItem('item-read', index)}
          readItems={() => this.readGroup('items-read', this.state.groupIndex)}
          disableGeolocation={() => this.setView('item-no-geo')}
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
          groupIndex={this.state.groupIndex}
          setView={(view) => this.setView(view)}
        />
        <main className="Main">
          {this.main()}
        </main>
      </div>
    );
  }
}
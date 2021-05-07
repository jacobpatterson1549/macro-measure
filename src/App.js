import './App.css';
import React from 'react';
import LocalStorage from './LocalStorage';

class App extends React.Component {

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

  clearStorage() {
    this.localStorage.clear();
    this.setState({
      view: Main.DefaultView,
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
          setView={view => this.setView(view)}
        />
        <Main
          distanceUnit={this.state.distanceUnit}
          view={this.state.view}
          groups={this.state.groups}
          currentGroup={this.state.currentGroup}
          currentGroupItem={this.state.currentGroupItem}
          setDistanceUnit={unit => this.setDistanceUnit(unit)}
          clearStorage={() => this.clearStorage()}
        />
      </div>
    );
  }
}

export default App;

class Header extends React.Component {

  headerItem(name, title, view) {
    return <span onClick={() => this.props.setView(view)} title={title}>{name}</span>
  }

  render() {
    return (
      <header className="Header">
        <a href="/"
          onClick={(e) => preventDefault(() => this.props.setView("groups"), e)}
          title="group list"
        >
          <span>{this.props.currentGroup}[ADD GROUP]</span>
        </a>
        {this.headerItem('ⓘ', 'about page', 'about')}
        {this.headerItem('?', 'help page', 'help')}
        {this.headerItem('⚙', 'edit settings', 'settings')}
      </header>
    );
  }
}

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
      default:
        return (<Groups
          groups={this.props.groups}
          currentGroup={this.props.currentGroup}
          currentGroupItem={this.props.currentGroupItem}
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

function About() {
  return (
    <p>TODO: about page</p>
  )
}

function Help() {
  return (
    <p>TODO: help page</p>
  )
}

class Settings extends React.Component {

  static DefaultDistanceUnit = 'm';

  static distanceUnits = [
    'm',
    'km',
    'ft',
    'yd',
    'mi'
  ];

  render() {
    const distanceUnitOptions = Settings.distanceUnits.map(unit =>
      <option key={unit}>{unit}</option>
    );
    return (
      <div>
        <h1>Macro Measure Settings</h1>
        <form>
          <label>
            <span>Distance Unit:</span>
            <select
              value={this.props.distanceUnit}
              onChange={event => this.props.setDistanceUnit(event.target.value)}
            >
              {distanceUnitOptions}
            </select>
          </label>
          <label>
            <span>Clear ALL Saved Data:</span>
            <input
              type="button"
              value="Clear"
              onClick={this.props.clearStorage}
            />
          </label>
        </form>
      </div>
    );
  }
}

class Groups extends React.Component {

  addGroup() {
    console.log("TODO: add group");
  }

  renameGroup(name) {
    console.log("TODO: rename group: " + name);
  }

  deleteGroup(name) {
    console.log("TODO: delete group: " + name);
  }

  render() {
    const items = Object.entries(this.props.groups).map((name, items) => (
      <tr key={name}>
        <td>{name}</td>
        <td>{items.length}</td>
        <td onClick={this.renameGroup(name)}>Edit</td>
        <td onClick={this.deleteGroup(name)}>Delete</td>
      </tr>
    ));
    if (items.length === 0) {
      items.push(<tr key="no-groups"><td colSpan="4">No groups exist.  Create one.</td></tr>);
    }
    return (
      <div>
        	
        <table>
          <caption>groups</caption>
          <thead>
          <tr>
            <th scope="col" title="identifier of items">Name</th>
            <th scope="col" title="number of items">#</th>
            <th scope="col" title="Rename">✎</th>
            <th scope="col" title="Delete">␡</th>
          </tr>
          </thead>
          <tbody>{items}</tbody>
        </table>
        <input
          type="button"
          value="Add Group"
          onClick={this.addGroup}
        />
      </div>
    );
  }
}

function preventDefault(fn, event) {
  event.preventDefault();
  fn();
}
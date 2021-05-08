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
          setCurrentGroup={groupName => this.setCurrentGroup(groupName)}
          createGroup={name => this.createGroup(name)}
          renameGroup={(oldName, newName) => this.renameGroup(oldName, newName)}
          moveGroupUp={name => this.moveGroupUp(name)}
          moveGroupDown={name => this.moveGroupDown(name)}
          deleteGroup={name => this.deleteGroup(name)}
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
          <span>{this.props.currentGroup || '[ADD GROUP]'}</span>
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

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      action: ""
    };

    this.setName = this.setName.bind(this);
    this.createGroup = this.createGroup.bind(this);
    this.renameGroup = this.renameGroup.bind(this);
    this.deleteGroup = this.deleteGroup.bind(this);
  }


  createGroup(event) {
    event.preventDefault();
    this.props.createGroup(this.state.name);
    this.setState({ action: "add-button" });
  }

  renameGroup(event) {
    event.preventDefault();
    this.props.renameGroup(this.state.oldName, this.state.name);
    this.setState({ action: "add-button" });
  }

  deleteGroup(event) {
    event.preventDefault();
    this.props.deleteGroup(this.state.name);
    this.setState({ action: "add-button" });
  }

  setName(event) {
    const uniqueName = this.uniqueName(event.target.value);
    const nameInput = event.target;
    nameInput.setCustomValidity(uniqueName ? '' : 'duplicate name');
    this.setState({ name: event.target.value });
  }

  uniqueName(name) {
    for (const group of this.props.groups) {
      const existingName = group.name;
      if (existingName === name && (this.state.action !== 'rename-form' || name !== this.state.oldName)) {
        return false;
      }
    }
    return true;
  }

  cancelButton() {
    return (<input type="button" value="cancel" onClick={() => this.setState({ action: "add-button"})} />);
  }

  getItems() {
    const items = this.props.groups.map((group, index, groups) => (
      <tr key={group.name}>
        <td onClick={() => this.props.setCurrentGroup(group.name)}>{group.name}</td>
        <td>{group.items.length}</td>
        <td><MoveRowSpan valid={index > 0} onClick={() => this.props.moveGroupUp(group.name)} title="move up" value="▲" /></td>
        <td><MoveRowSpan valid={index + 1 < groups.length} onClick={() => this.props.moveGroupDown(group.name)} title="move down" value="▼" /></td>
        <td onClick={() => this.setState({ name: group.name, action: 'rename-form', oldName: group.name })}>Edit</td>
        <td onClick={() => this.setState({ name: group.name, action: 'delete-form' })}>Delete</td>
      </tr>
    ));
    if (items.length === 0) {
      items.push(<tr key="no-groups"><td colSpan="4">No groups exist.  Create one.</td></tr>);
    }
    return items;
  }

  groupsTable() {
    return (<table>
      <caption>groups</caption>
      <thead>
        <tr>
          <th scope="col" title="name of group">Name</th>
          <th scope="col" title="number of items in group">#</th>
          <th scope="col" title="Move Group Up"></th>
          <th scope="col" title="Move Group Down"></th>
          <th scope="col" title="Rename group">✎</th>
          <th scope="col" title="Delete group">␡</th>
        </tr>
      </thead>
      <tbody>{this.getItems()}</tbody>
    </table>);
  }

  getAction() {
    switch (this.state.action) {
      case "add-form":
        return (<form onSubmit={this.createGroup}>
          <input type="text" value={this.state.name} required onChange={this.setName} onFocus={(event) => event.target.select()} />
          {this.cancelButton()}
          <input type="submit" />
        </form>);
      case "rename-form":
        return (<form onSubmit={this.renameGroup}>
          <input type="text" value={this.state.name} required onChange={this.setName} onFocus={(event) => event.target.select()} />
          {this.cancelButton()}
          <input type="submit" />
        </form>);
      case "delete-form":
        return (<form onSubmit={this.deleteGroup}>
          <span>Delete {this.state.name}?</span>
          {this.cancelButton()}
          <input type="submit" />
        </form>);
      default:
        return (<input type="button" value="Add Group" onClick={() => this.setState({ name: '[New Group Name]', action: 'add-form' })} onFocus={(event) => event.target.select()} />);
    }
  }

  render() {
    return (
      <div className="Groups">
        {this.groupsTable()}
        {this.getAction()}
      </div>
    );
  }
}

class MoveRowSpan extends React.Component {
  render() {
    let span;
    if (this.props.valid) {
      span = (<span title={this.props.title} onClick={this.props.onClick}>{this.props.value}</span>);
    } else {
      span = (<span />);
    }
    return (<div>{span}</div>);
  }
}

class Items extends React.Component {
  render() {
    return (
      <p>TODO: show items for {this.props.currentGroup}</p>
    );
  }
}

function preventDefault(fn, event) {
  event.preventDefault();
  fn();
}
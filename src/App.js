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
          setView={view => this.setView(view)}
        />
        <Main
          distanceUnit={this.state.distanceUnit}
          view={this.state.view}
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
          <span>Macro Measure</span>
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
        return (<Groups />);
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

function Groups() {
  return (
    <p>TODO: groups page</p>
  )
}

function preventDefault(fn, event) {
  event.preventDefault();
  fn();
}
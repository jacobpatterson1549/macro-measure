import './App.css';
import React from 'react';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      view: "groups",
    };
  }

  setView(view) {
    this.setState({ view: view });
  }

  render() {
    return (
      <div className="App">
        <Header onClick={view => this.setView(view)} />
        <Main view={this.state.view} />
      </div>
    );
  }
}

export default App;

class Header extends React.Component {

  headerItem(name, title, view) {
    return <span onClick={() => this.props.onClick(view)} title={title}>{name}</span>
  }

  render() {
    return (
      <header className="Header">
        <a href="/" onClick={(e) => preventDefault(() => this.props.onClick("groups"), e)} title="group list">Macro Measure</a>
        {this.headerItem('ⓘ', 'about page', 'about')}
        {this.headerItem('?', 'help page', 'help')}
        {this.headerItem('⚙', 'edit settings', 'settings')}
      </header>
    );
  }
}

class Main extends React.Component {

  renderView() {
    switch (this.props.view) {
      case 'about':
        return (<About />);
      case 'help':
        return (<Help />);
      case 'settings':
        return (<Settings />);
      case 'groups':
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

function Settings() {
  return (
    <p>TODO: settings page</p>
  )
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
import './App.css';
import React from 'react';


function App() {
  return <Header />
}

export default App;

class Header extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      view: props.view || 'groups',
    };
  }

  render() {
    return (
      <div className="App">
        <header>
          <span onClick={() => { this.setState({view: 'groups'}); }} title="home">Macro Measure</span>
          <span onClick={() => { this.setState({view: 'about'}); }} title="About">ⓘ</span>
          <span onClick={() => { this.setState({view: 'help'}); }} title="Help">?</span>
          <span onClick={() => { this.setState({view: 'settings'}); }} title="Settings">⚙</span>
        </header>
        <main>
          <Main view={this.state.view} />
        </main>
      </div>
    );
  }
}

class Main extends React.Component {
  render() {
    return (
      <p>TODO: {this.props.view}</p>
    );
  };
}
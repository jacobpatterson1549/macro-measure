import { Component } from 'react';

import { LocalStorageSettings } from './LocalStorageSettings';

import { clear as clearLocalStorage } from '../utils/LocalStorage';

export class ErrorBoundary extends Component {

  state = { error: null };

  static getDerivedStateFromError = (error) => (
    { error }
  );

  renderError = () => {
    clearLocalStorage();
    return (
      <div>
        <h1>Something went wrong.</h1>
        {
          this.state.error.message &&
          <h3>{this.state.error.message}</h3>
        }
        <h2>Possible fixes:</h2>
        <ol>
          <li>Reload the page</li>
          <li>Delete or import saved data</li>
          <li>File a bug report</li>
        </ol>
        <LocalStorageSettings />
      </div>
    );
  };

  render = () => (
    (!this.state.error)
      ? this.props.children
      : this.renderError()
  );
}
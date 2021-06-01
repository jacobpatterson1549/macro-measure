import { Component } from 'react';

import { LocalStorageSettings } from './LocalStorageSettings';

export class ErrorBoundary extends Component {

  state = { error: null };

  static getDerivedStateFromError = (error) => (
    { error }
  );

  render = () => (!this.state.error)
    ? this.props.children
    : (
      <div>
        <h1>Something went wrong.</h1>
        {
          this.state.error.message &&
          <h3>{this.state.error.message}</h3>
        }
        <p>Deleting or importing saved data may fix the problem.</p>
        <LocalStorageSettings />
      </div>
    );
};
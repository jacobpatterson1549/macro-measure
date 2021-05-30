import { Component } from 'react';

import { LocalStorageSettings } from './LocalStorageSettings';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error: error,
    };
  }

  render() {
    return (!this.state.hasError)
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
  }
}
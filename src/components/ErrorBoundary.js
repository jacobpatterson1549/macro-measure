import React from 'react';
import { LocalStorageSettings } from './LocalStorageSettings';

export class ErrorBoundary extends React.Component {
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
    if (this.state.hasError) {
      return (
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

    return this.props.children;
  }
}
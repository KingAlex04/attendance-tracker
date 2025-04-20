'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRefresh = () => {
    // Clear localStorage before reloading
    try {
      if (typeof window !== 'undefined') {
        // localStorage.clear(); // You might want to be more selective
        // Instead of clearing everything, just clear auth data if needed
        console.log('Refreshing page after error');
      }
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h2 className="text-red-800 text-lg font-semibold">Something went wrong</h2>
            <p className="text-red-600 mt-2">
              An error occurred while loading this page. Please try refreshing or contact support if the problem persists.
            </p>
            {this.state.error && (
              <div className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded">
                {this.state.error.toString()}
              </div>
            )}
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={this.handleRefresh}
            >
              Refresh Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
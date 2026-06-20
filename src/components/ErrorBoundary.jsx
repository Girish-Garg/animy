import React from 'react';

/**
 * Catches render-time errors anywhere in the child tree and shows a fallback
 * instead of unmounting the whole app to a blank screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          role="alert"
          className="flex h-screen flex-col items-center justify-center gap-4 bg-[#070B14] text-white"
        >
          <h2 className="text-xl font-semibold">Something went wrong.</h2>
          <p className="text-sm text-gray-400">
            An unexpected error occurred. Try reloading the page.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[#0075FF] px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

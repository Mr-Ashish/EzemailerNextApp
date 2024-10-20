// components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state to render fallback UI on the next render
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error Boundary Caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render any custom fallback UI
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center">
          <h1 className="text-3xl font-semibold text-gray-800">
            Something went wrong.
          </h1>
          <p className="mt-2 text-center text-gray-600">
            We're sorry for the inconvenience. Please try refreshing the page or
            contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

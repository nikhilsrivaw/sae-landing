import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging for debugging
    console.group('🚨 ErrorBoundary caught an error');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Info:', errorInfo);
    console.groupEnd();

    // Store error details in state for display
    this.setState({
      hasError: true,
      error: {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">!</span>
              </div>
              <h1 className="text-white text-4xl font-bold mb-4" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                SYSTEM ERROR
              </h1>
              <p className="text-gray-300 text-lg mb-4">
                Something went wrong. Please refresh the page.
              </p>
              {this.state.error && (
                <div className="text-left bg-gray-900 p-4 rounded mb-4 max-w-2xl">
                  <p className="text-red-400 font-bold mb-2">Error Details:</p>
                  <p className="text-white text-sm mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </p>
                  <details className="text-gray-300 text-xs">
                    <summary className="cursor-pointer text-blue-400 mb-2">Show Stack Trace</summary>
                    <pre className="bg-black p-2 rounded overflow-auto max-h-32 text-xs">
                      {this.state.error.stack}
                    </pre>
                  </details>
                  {this.state.error.componentStack && (
                    <details className="text-gray-300 text-xs mt-2">
                      <summary className="cursor-pointer text-blue-400 mb-2">Show Component Stack</summary>
                      <pre className="bg-black p-2 rounded overflow-auto max-h-32 text-xs">
                        {this.state.error.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-red-500/25"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              RELOAD PAGE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
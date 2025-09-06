import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            {/* Error icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FiAlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600">
                The Earthquake Visualizer encountered an unexpected error.
              </p>
            </div>

            {/* Error details */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                What happened?
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                An unexpected error occurred while rendering the application. This might be due to:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Network connectivity issues</li>
                <li>• Browser compatibility problems</li>
                <li>• Temporary server issues</li>
                <li>• Corrupted application state</li>
              </ul>

              {/* Technical details (collapsible) */}
              {this.state.error && (
                <details className="mt-4 p-4 bg-gray-50 rounded border">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Technical Details (for developers)
                  </summary>
                  <div className="text-xs font-mono text-gray-600 mt-2">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiRefreshCw className="w-5 h-5 mr-2" />
                Reload Application
              </button>
              
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiHome className="w-5 h-5 mr-2" />
                Try Again
              </button>
            </div>

            {/* Help text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                If the problem persists, please try refreshing your browser or check your internet connection.
              </p>
            </div>

            {/* Support info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-900">
                    Need help?
                  </h3>
                  <p className="text-sm text-blue-800 mt-1">
                    This application uses real-time data from the USGS Earthquake Hazards Program. 
                    Make sure you have a stable internet connection and try refreshing the page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

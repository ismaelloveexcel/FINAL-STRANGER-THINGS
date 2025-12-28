import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * ErrorBoundary Component - Error Handling System
 *
 * Features:
 * - Catches JavaScript errors anywhere in child component tree
 * - Logs error information for debugging
 * - Displays fallback UI when error occurs
 * - Retry mechanism to attempt recovery
 * - Error reporting (can be extended to send to analytics)
 * - Graceful degradation
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error reporting service (e.g., Sentry, LogRocket)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // This is where you would send errors to your error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    // For now, we'll just log to console with structured data
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.log('Error Report:', JSON.stringify(errorReport, null, 2));

    // Store in sessionStorage for potential later retrieval
    try {
      const existingErrors = JSON.parse(sessionStorage.getItem('gameErrors') || '[]');
      existingErrors.push(errorReport);
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.shift();
      }
      sessionStorage.setItem('gameErrors', JSON.stringify(existingErrors));
    } catch (e) {
      console.error('Failed to store error in sessionStorage:', e);
    }
  }

  handleRetry = (): void => {
    const maxRetries = 3;

    if (this.state.retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1
      });
    } else {
      alert('Maximum retry attempts reached. Please refresh the page.');
    }
  };

  handleReload = (): void => {
    // Clear any potentially corrupted state
    sessionStorage.removeItem('gameState');
    localStorage.removeItem('gameProgress');

    // Reload the page
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            padding: '20px',
            zIndex: 9999
          }}
        >
          {/* Stranger Things themed error screen */}
          <div
            style={{
              maxWidth: '600px',
              textAlign: 'center',
              backgroundColor: 'rgba(30, 0, 0, 0.8)',
              border: '3px solid #ff0000',
              borderRadius: '15px',
              padding: '40px',
              boxShadow: '0 0 50px rgba(255, 0, 0, 0.5)'
            }}
          >
            {/* Flickering lights effect */}
            <div
              style={{
                fontSize: '64px',
                marginBottom: '20px',
                animation: 'flicker 2s infinite'
              }}
            >
              ⚠️
            </div>

            <h1
              style={{
                fontSize: '32px',
                marginBottom: '10px',
                color: '#ff4444',
                textShadow: '0 0 10px rgba(255, 100, 100, 0.8)',
                animation: 'glow 1.5s ease-in-out infinite'
              }}
            >
              SOMETHING WENT WRONG
            </h1>

            <p
              style={{
                fontSize: '18px',
                marginBottom: '30px',
                color: '#ffaaaa',
                fontStyle: 'italic'
              }}
            >
              The Upside Down has corrupted the game...
            </p>

            {/* Error details (collapsible) */}
            <details
              style={{
                marginBottom: '30px',
                textAlign: 'left',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#ffcc00',
                  marginBottom: '10px',
                  userSelect: 'none'
                }}
              >
                📋 Error Details
              </summary>

              {this.state.error && (
                <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#ff8888' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Error:</strong>
                    <pre
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        padding: '10px',
                        borderRadius: '5px',
                        overflow: 'auto',
                        maxHeight: '100px'
                      }}
                    >
                      {this.state.error.message}
                    </pre>
                  </div>

                  {this.state.error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          padding: '10px',
                          borderRadius: '5px',
                          overflow: 'auto',
                          maxHeight: '150px',
                          fontSize: '10px'
                        }}
                      >
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </details>

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <button
                onClick={this.handleRetry}
                disabled={this.state.retryCount >= 3}
                style={{
                  backgroundColor: this.state.retryCount >= 3 ? '#555' : '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: this.state.retryCount >= 3 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 15px rgba(255, 100, 100, 0.5)',
                  opacity: this.state.retryCount >= 3 ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (this.state.retryCount < 3) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 100, 100, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 100, 100, 0.5)';
                }}
              >
                🔄 Retry ({3 - this.state.retryCount} left)
              </button>

              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#6644ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 15px rgba(100, 100, 255, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(100, 100, 255, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(100, 100, 255, 0.5)';
                }}
              >
                🔃 Reload Game
              </button>
            </div>

            {/* Support message */}
            <p
              style={{
                marginTop: '30px',
                fontSize: '12px',
                color: '#888',
                fontStyle: 'italic'
              }}
            >
              If this error persists, try clearing your browser cache or contact support.
            </p>

            {/* Retry count indicator */}
            {this.state.retryCount > 0 && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '10px',
                  backgroundColor: 'rgba(255, 200, 0, 0.2)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#ffcc00',
                  border: '1px solid rgba(255, 200, 0, 0.5)'
                }}
              >
                ⚠️ Retry attempt {this.state.retryCount} of 3
              </div>
            )}
          </div>

          {/* CSS Animation */}
          <style>{`
            @keyframes flicker {
              0%, 100% { opacity: 1; }
              25% { opacity: 0.6; }
              50% { opacity: 1; }
              75% { opacity: 0.8; }
            }

            @keyframes glow {
              0%, 100% {
                text-shadow: 0 0 10px rgba(255, 100, 100, 0.8);
              }
              50% {
                text-shadow: 0 0 20px rgba(255, 100, 100, 1), 0 0 30px rgba(255, 100, 100, 0.8);
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for easier usage with hooks
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Error logging utility
 */
export function logError(error: Error, context?: Record<string, any>): void {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.error('Manual Error Log:', errorReport);

  // Store in sessionStorage
  try {
    const existingErrors = JSON.parse(sessionStorage.getItem('gameErrors') || '[]');
    existingErrors.push(errorReport);
    if (existingErrors.length > 10) {
      existingErrors.shift();
    }
    sessionStorage.setItem('gameErrors', JSON.stringify(existingErrors));
  } catch (e) {
    console.error('Failed to store error:', e);
  }
}

/**
 * Get all logged errors
 */
export function getLoggedErrors(): any[] {
  try {
    return JSON.parse(sessionStorage.getItem('gameErrors') || '[]');
  } catch (e) {
    console.error('Failed to retrieve errors:', e);
    return [];
  }
}

/**
 * Clear logged errors
 */
export function clearLoggedErrors(): void {
  try {
    sessionStorage.removeItem('gameErrors');
  } catch (e) {
    console.error('Failed to clear errors:', e);
  }
}

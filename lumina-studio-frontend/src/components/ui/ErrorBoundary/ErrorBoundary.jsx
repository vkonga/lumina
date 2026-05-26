import React from 'react';

/**
 * ErrorBoundary — catches JS errors in child component tree and renders a
 * fallback UI instead of crashing the whole page.
 *
 * @example
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // In production, send to your error tracking service
        if (typeof window !== 'undefined' && window.__LUMINA_LOGGER__) {
            window.__LUMINA_LOGGER__({ error, info });
        } else {
            console.error('[ErrorBoundary]', error, info);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary" role="alert">
                    <h2 className="title-serif gold-text">Something went wrong.</h2>
                    <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <button
                        className="btn-outline"
                        style={{ marginTop: '2rem' }}
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;

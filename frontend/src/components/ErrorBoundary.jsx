import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', fontFamily: 'monospace', background: '#1a1a2e', color: '#fff', minHeight: '100vh' }}>
                    <h1 style={{ color: '#C4A44B', marginBottom: '20px' }}>Something went wrong</h1>
                    <div style={{ background: '#0a0a1a', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                        <h3 style={{ color: '#ff6b6b' }}>Error:</h3>
                        <pre style={{ color: '#ccc', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                            {this.state.error?.toString()}
                        </pre>
                    </div>
                    {this.state.errorInfo && (
                        <div style={{ background: '#0a0a1a', padding: '20px', borderRadius: '12px' }}>
                            <h3 style={{ color: '#ff6b6b' }}>Component Stack:</h3>
                            <pre style={{ color: '#888', whiteSpace: 'pre-wrap', fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </div>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '20px', padding: '12px 24px', background: '#C4A44B', color: '#0a1628', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;

import React, { type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component to catch and display React errors gracefully
 */
export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true };
    }

    componentDidCatch(_error: Error, errorInfo: React.ErrorInfo) {
        const error = _error;
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full bg-gradient-to-br from-red-900/20 to-background text-white flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-red-950/50 border-2 border-red-500 rounded-xl p-6 backdrop-blur">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle size={32} className="text-red-400" />
                            <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
                        </div>

                        <p className="text-gray-300 mb-4">
                            We encountered an unexpected error. The game state may be corrupted.
                        </p>

                        {this.state.error && this.state.errorInfo && (
                            <details className="mb-4 bg-red-900/30 p-3 rounded border border-red-700">
                                <summary className="cursor-pointer font-mono text-sm text-red-300 hover:text-red-200">
                                    Error Details
                                </summary>
                                <pre className="mt-2 text-xs text-red-200 overflow-auto max-h-48 whitespace-pre-wrap break-words">
                                    {this.state.error.toString()}
                                    {'\n\n'}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.resetError}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <RotateCcw size={18} />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Reload
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 mt-4 text-center">
                            If this keeps happening, try clearing your browser cache or joining a different room.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

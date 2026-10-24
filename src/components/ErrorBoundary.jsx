import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import BrandLogo from './BrandLogo';

/**
 * Application-wide React Error Boundary
 * Prevents a blank screen if any route or child component throws during rendering.
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[HangBug ErrorBoundary] Caught rendering error:', error, errorInfo);
    }

    componentDidUpdate(prevProps) {
        if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
            this.setState({ hasError: false, error: null });
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        if (typeof this.props.onReset === 'function') {
            this.props.onReset();
        }
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 text-center transition-colors duration-200">
                    <div className="max-w-md w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 shadow-xl space-y-5">
                        <div className="flex justify-center">
                            <BrandLogo variant="mark" size="lg" />
                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                            <AlertTriangle size={28} />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">
                                Something went wrong
                            </h1>
                            <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed">
                                {this.state.error?.message || 'An unexpected error occurred while displaying this page.'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={this.handleRetry}
                                className="btn-primary w-full sm:w-auto justify-center text-xs py-2.5 px-5 inline-flex items-center gap-2 cursor-pointer"
                            >
                                <RefreshCw size={14} /> Try Again
                            </button>
                            <button
                                type="button"
                                onClick={this.handleGoHome}
                                className="btn-secondary w-full sm:w-auto justify-center text-xs py-2.5 px-5 inline-flex items-center gap-2 cursor-pointer"
                            >
                                <Home size={14} /> Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

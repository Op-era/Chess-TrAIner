console.log('Module loaded: components/ErrorBoundary.tsx');
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    console.error("ErrorBoundary caught an error in getDerivedStateFromError:", error);
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error in componentDidCatch:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-lg shadow-xl p-6 ring-1 ring-red-500/50">
                <h1 className="text-2xl font-bold text-red-400">Application Error</h1>
                <p className="mt-2 text-slate-300">Something went wrong, and the application could not be rendered. This is likely a bug.</p>
                <p className="mt-2 text-slate-400">Please check the details below and open your browser's developer console for more information.</p>
                
                <div className="mt-4 bg-slate-900 p-4 rounded-md text-sm text-red-300 overflow-auto">
                    <h2 className="font-bold mb-2">Error Details:</h2>
                    <pre className="whitespace-pre-wrap font-mono">
                        {this.state.error?.toString()}
                    </pre>
                    {this.state.errorInfo && (
                        <>
                            <h2 className="font-bold mt-4 mb-2">Component Stack:</h2>
                            <pre className="whitespace-pre-wrap font-mono">
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </>
                    )}
                </div>
                 <button
                    onClick={() => window.location.reload()}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition-all"
                >
                    Reload Application
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
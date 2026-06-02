import React from 'react';
import { Flame, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[GasAja] ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gas-darker px-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <Flame className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Oops! Ada yang error 😵</h1>
          <p className="text-gray-400 text-sm mb-2 max-w-md">
            Aplikasi mengalami masalah. Coba refresh halaman ini.
          </p>
          <p className="text-red-400/60 text-xs font-mono mb-6 max-w-md break-all">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-gas-green text-gas-darker font-bold rounded-2xl hover:brightness-110 transition-all"
          >
            <RefreshCw className="w-5 h-5" /> Refresh Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

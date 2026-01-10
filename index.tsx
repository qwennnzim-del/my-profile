import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fixed: Make children optional to avoid 'Property children is missing' error in some usages
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Error Boundary Sederhana untuk menangkap crash
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  // Explicitly initialize state and props in constructor to satisfy TypeScript
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Log error asli ke console agar developer bisa debug objectnya
    console.error("Zenith App Crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Safe error message extraction
      let errorMessage = "Unknown error";
      const err = this.state.error;

      try {
        if (err instanceof Error) {
            errorMessage = err.message;
            // Stack trace optional, bisa bikin UI berantakan kalau terlalu panjang
            // if (err.stack) errorMessage += "\n" + err.stack;
        } else if (typeof err === 'string') {
            errorMessage = err;
        } else {
            // AVOID JSON.stringify for unknown objects to prevent "Converting circular structure to JSON"
            // Firebase errors are often circular.
            errorMessage = String(err); 
            if (errorMessage === '[object Object]') {
                // Try to extract some useful info safely if possible, or just keep generic
                try {
                    // Coba ambil code atau message jika ada (common in Firebase)
                    if (err.code) errorMessage = `Error Code: ${err.code}`;
                    if (err.message) errorMessage += ` - ${err.message}`;
                } catch (e) {
                    errorMessage = "An unexpected error occurred (Object details in console).";
                }
            }
        }
      } catch (e) {
        errorMessage = "Error details could not be displayed. Check browser console.";
      }

      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#333' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Something went wrong.</h1>
          <p style={{ color: '#666' }}>Aplikasi mengalami crash. Cek console browser untuk detailnya.</p>
          <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', overflow: 'auto', textAlign: 'left', marginTop: '20px', fontSize: '12px', maxHeight: '400px', whiteSpace: 'pre-wrap' }}>
            {errorMessage}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
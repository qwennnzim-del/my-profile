import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fixed: Make children optional to avoid 'Property children is missing' error in some usages
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Error Boundary Sederhana untuk menangkap crash
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fixed: Explicitly declare state property to satisfy TypeScript
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Zenith App Crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Safe error message extraction
      let errorMessage = "Unknown error";
      try {
        if (this.state.error instanceof Error) {
            errorMessage = this.state.error.message;
            if (this.state.error.stack) {
                errorMessage += "\n" + this.state.error.stack;
            }
        } else if (typeof this.state.error === 'string') {
            errorMessage = this.state.error;
        } else {
            errorMessage = JSON.stringify(this.state.error, null, 2);
        }
      } catch (e) {
        errorMessage = "Error object could not be displayed (Circular reference or similar). Check console.";
      }

      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#333' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Something went wrong.</h1>
          <p style={{ color: '#666' }}>Aplikasi mengalami crash. Cek console browser untuk detailnya.</p>
          <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', overflow: 'auto', textAlign: 'left', marginTop: '20px', fontSize: '12px', maxHeight: '400px' }}>
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
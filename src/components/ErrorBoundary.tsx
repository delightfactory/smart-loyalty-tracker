import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <h2 style={{ color: 'red', marginBottom: 16 }}>حدث خطأ غير متوقع!</h2>
          <pre style={{ background: '#f8d7da', color: '#721c24', padding: 16, borderRadius: 8, maxWidth: 600, overflow: 'auto' }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button style={{ marginTop: 24, padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={() => window.location.reload()}>إعادة تحميل الصفحة</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

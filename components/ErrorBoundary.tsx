import React from "react";

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // Log error to monitoring service if needed
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-6 text-red-400">An unexpected error occurred. Please refresh the page.<br/><pre>{String(this.state.error)}</pre></div>;
    }
    return this.props.children;
  }
}

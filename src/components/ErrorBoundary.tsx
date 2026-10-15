import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-muted">
          This page hit an unexpected error. The rest of Openly is still available.
        </p>
        <button
          type="button"
          className="mt-6 rounded-lg bg-accent px-4 py-2 font-semibold text-canvas"
          onClick={() => this.setState({ error: null })}
        >
          Try again
        </button>
        <Link className="ml-4 text-accent" to="/">
          Go home
        </Link>
      </div>
    );
  }
}

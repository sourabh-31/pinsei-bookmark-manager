import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
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
    console.error(
      "Uncaught error in component tree:",
      error,
      info.componentStack,
    );
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return <DefaultErrorFallback error={error} reset={this.reset} />;
  }
}

/** Compact fallback for boundaries nested inside app chrome (e.g. inside a layout's <main>), where a full-viewport takeover would fight with the surrounding header/nav that's still usable. */
export function SectionErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-2xl bg-card shadow-card">
        <AlertTriangle size={18} className="text-destructive" />
      </span>
      <div className="flex flex-col items-center gap-1.5">
        <p className="font-semibold text-foreground">Something went wrong</p>
        <p className="max-w-[26em] text-[12.5px] leading-[1.6] font-medium text-muted-foreground">
          {import.meta.env.DEV
            ? error.message
            : "This page ran into a problem. Try again, or use the nav to go elsewhere."}
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}

function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-app-shell px-4.5 py-8 text-center">
      <span className="grid size-13 place-items-center rounded-2xl bg-card shadow-card">
        <AlertTriangle size={22} className="text-destructive" />
      </span>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-[26px] leading-[1.15] font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-[29em] text-[13.5px] leading-[1.55] font-medium text-muted-foreground">
          {import.meta.env.DEV
            ? error.message
            : "An unexpected error occurred. Try again, or head back to your bookmarks."}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
        <Button asChild>
          <Link to="/home" onClick={reset}>
            Back to your bookmarks
          </Link>
        </Button>
      </div>
    </div>
  );
}

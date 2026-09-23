import { Component } from "react";

/**
 * Catches render/lifecycle errors in the component tree below it and
 * shows a fallback instead of letting React unmount the whole app to a
 * white screen. Error boundaries have to be class components — there's
 * no hook equivalent (as of React 19).
 *
 * Two places this gets used:
 *  - Once at the very top (main.jsx), wrapping the entire app. Last
 *    line of defence — if this fires, something's badly wrong.
 *  - Once inside each dashboard layout (AdminLayout/UserLayout/
 *    TechnicianLayout), wrapping just the <Outlet/>. A crash on one
 *    dashboard page then only takes out that page's content — the
 *    sidebar, nav, and logout button stay usable so the person isn't
 *    stuck. See RouteErrorBoundary below for the piece that also
 *    resets automatically when they navigate away.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Single place to wire up real error reporting (Sentry etc.) later
    // without touching every page that might throw.
    console.error("ErrorBoundary caught an error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.handleReset);
      }

      return this.props.fullPage ? (
        <FullPageFallback onReset={this.handleReset} />
      ) : (
        <InlineFallback onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

const styles = {
  fullPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "2rem",
    fontFamily: "system-ui, sans-serif",
    background: "#fff",
    color: "#1a1a1a",
  },
  inline: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "3rem 1.5rem",
    fontFamily: "system-ui, sans-serif",
    color: "#1a1a1a",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 600,
    margin: "0 0 0.5rem",
  },
  message: {
    color: "#555",
    margin: "0 0 1.5rem",
    maxWidth: "28rem",
  },
  buttonRow: {
    display: "flex",
    gap: "0.75rem",
  },
  primaryButton: {
    padding: "0.6rem 1.25rem",
    borderRadius: "8px",
    border: "none",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 500,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "0.6rem 1.25rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#1a1a1a",
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },
};

function FullPageFallback({ onReset }) {
  return (
    <div style={styles.fullPage} role="alert">
      <p style={styles.title}>Something went wrong.</p>
      <p style={styles.message}>
        This page ran into an unexpected error. You can try again, or head
        back to the homepage.
      </p>
      <div style={styles.buttonRow}>
        <button
          type="button"
          style={styles.primaryButton}
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
        <a href="/" style={styles.secondaryButton}>
          Go to homepage
        </a>
      </div>
    </div>
  );
}

function InlineFallback({ onReset }) {
  return (
    <div style={styles.inline} role="alert">
      <p style={styles.title}>This section hit a snag.</p>
      <p style={styles.message}>
        Something went wrong loading this page. The rest of your dashboard
        is still fine — try again, or pick something else from the menu.
      </p>
      <div style={styles.buttonRow}>
        <button
          type="button"
          style={styles.primaryButton}
          onClick={onReset}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundary;

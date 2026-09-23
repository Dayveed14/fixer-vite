import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import RouteErrorBoundary from "./RouteErrorBoundary";

// A component that throws on demand — the standard way to trigger an
// error boundary in a test, since you can't just `throw` inline in JSX.
function Bomb({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error("Boom");
  }
  return <div>All good</div>;
}

describe("ErrorBoundary", () => {
  it("renders children normally when nothing throws", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("catches a render error and shows the inline fallback by default", () => {
    // React logs the caught error to the console by default in test
    // environments too — silence it so the test output stays clean;
    // we're asserting on the fallback UI, not the console.
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/this section hit a snag/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();

    console.error.mockRestore();
  });

  it("shows the full-page fallback (reload + homepage link) when fullPage is set", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fullPage>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/something went wrong\./i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to homepage/i })).toBeInTheDocument();

    console.error.mockRestore();
  });

  it('"Try again" re-renders the children instead of staying stuck on the error', async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    // React 19 retries a failed render once internally before the
    // boundary's fallback ever shows, so a "throws exactly once" counter
    // would get silently absorbed by that retry. Using an externally
    // controlled flag instead means it throws consistently until the
    // test explicitly flips it — the realistic shape of "the underlying
    // bug/bad state got fixed", which is what "Try again" is for.
    const throwFlag = { current: true };
    function ControllableBomb() {
      if (throwFlag.current) {
        throw new Error("Boom");
      }
      return <div>Recovered</div>;
    }

    render(
      <ErrorBoundary>
        <ControllableBomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/this section hit a snag/i)).toBeInTheDocument();

    throwFlag.current = false;
    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByText("Recovered")).toBeInTheDocument();

    console.error.mockRestore();
  });
});

describe("RouteErrorBoundary", () => {
  it("resets when the route changes, so navigating away clears a stuck error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();

    function BrokenPage() {
      return (
        <RouteErrorBoundary>
          <Bomb shouldThrow={true} />
        </RouteErrorBoundary>
      );
    }

    function FinePage() {
      return (
        <RouteErrorBoundary>
          <div>Fine page content</div>
        </RouteErrorBoundary>
      );
    }

    function Harness() {
      return (
        <div>
          <Link to="/fine">Go to fine page</Link>
          <Routes>
            <Route path="/broken" element={<BrokenPage />} />
            <Route path="/fine" element={<FinePage />} />
          </Routes>
        </div>
      );
    }

    render(
      <MemoryRouter initialEntries={["/broken"]}>
        <Harness />
      </MemoryRouter>,
    );

    // The boundary catches the crash on the first page.
    expect(screen.getByText(/this section hit a snag/i)).toBeInTheDocument();

    // Navigating to a different route should show that page cleanly —
    // not a leftover error from the page they just left.
    await user.click(screen.getByText("Go to fine page"));

    expect(screen.getByText("Fine page content")).toBeInTheDocument();
    expect(screen.queryByText(/this section hit a snag/i)).not.toBeInTheDocument();

    console.error.mockRestore();
  });
});

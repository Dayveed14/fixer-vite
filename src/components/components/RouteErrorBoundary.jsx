import { useLocation } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";

/**
 * Same as ErrorBoundary, but resets itself automatically when the route
 * changes. Without this, clicking to a different dashboard page after a
 * crash would still show the old error — React has no way to know "try
 * rendering the new page" on its own once a boundary has tripped.
 * Passing `location.pathname` as the `key` forces React to unmount and
 * remount the boundary (and therefore clear its error state) any time
 * the path changes.
 */
export default function RouteErrorBoundary({ children }) {
  const location = useLocation();

  return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>;
}

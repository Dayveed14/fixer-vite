import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount whatever the last test rendered, so tests don't leak DOM/state
// into each other.
afterEach(() => {
  cleanup();
  localStorage.clear();
});

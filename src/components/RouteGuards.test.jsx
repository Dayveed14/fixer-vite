import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import UserPrivateRoutes from "./UserPrivateRoutes";
import TechnicianPrivateRoutes from "./TechnicianPrivateRoutes";

function setUser(user) {
  if (user === null) {
    localStorage.removeItem("user");
  } else {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

// Each guard renders <Outlet/> (the protected page) when the role
// matches, or redirects elsewhere when it doesn't. Rendering a
// MemoryRouter with routes for every possible destination and checking
// which one ends up on screen is the standard way to test a redirect.
function renderGuardedRoute(Guard, protectedPath) {
  render(
    <MemoryRouter initialEntries={[protectedPath]}>
      <Routes>
        <Route element={<Guard />}>
          <Route path={protectedPath} element={<div>Protected content</div>} />
        </Route>
        <Route path="/" element={<div>Public home</div>} />
        <Route path="/dashboard" element={<div>Customer dashboard</div>} />
        <Route path="/admindashboard" element={<div>Admin dashboard</div>} />
        <Route
          path="/techniciandashboard"
          element={<div>Technician dashboard</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminRoutes", () => {
  it("redirects to home when nothing is logged in", () => {
    setUser(null);
    renderGuardedRoute(AdminRoutes, "/admin-only");
    expect(screen.getByText("Public home")).toBeInTheDocument();
  });

  it("redirects a customer to their own dashboard instead of showing admin content", () => {
    setUser({ role: "user" });
    renderGuardedRoute(AdminRoutes, "/admin-only");
    expect(screen.getByText("Customer dashboard")).toBeInTheDocument();
  });

  it("redirects a technician to their own dashboard", () => {
    setUser({ role: "technician" });
    renderGuardedRoute(AdminRoutes, "/admin-only");
    expect(screen.getByText("Technician dashboard")).toBeInTheDocument();
  });

  it("renders the protected content for an admin", () => {
    setUser({ role: "admin" });
    renderGuardedRoute(AdminRoutes, "/admin-only");
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("treats corrupted localStorage the same as logged out, rather than crashing", () => {
    localStorage.setItem("user", "{not valid json");
    renderGuardedRoute(AdminRoutes, "/admin-only");
    expect(screen.getByText("Public home")).toBeInTheDocument();
  });
});

describe("UserPrivateRoutes", () => {
  it("redirects to home when nothing is logged in", () => {
    setUser(null);
    renderGuardedRoute(UserPrivateRoutes, "/user-only");
    expect(screen.getByText("Public home")).toBeInTheDocument();
  });

  it("redirects an admin to the admin dashboard instead of showing customer content", () => {
    setUser({ role: "admin" });
    renderGuardedRoute(UserPrivateRoutes, "/user-only");
    expect(screen.getByText("Admin dashboard")).toBeInTheDocument();
  });

  it("renders the protected content for a customer", () => {
    setUser({ role: "user" });
    renderGuardedRoute(UserPrivateRoutes, "/user-only");
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});

describe("TechnicianPrivateRoutes", () => {
  it("redirects to home when nothing is logged in", () => {
    setUser(null);
    renderGuardedRoute(TechnicianPrivateRoutes, "/tech-only");
    expect(screen.getByText("Public home")).toBeInTheDocument();
  });

  it("redirects a customer to their own dashboard", () => {
    setUser({ role: "user" });
    renderGuardedRoute(TechnicianPrivateRoutes, "/tech-only");
    expect(screen.getByText("Customer dashboard")).toBeInTheDocument();
  });

  it("renders the protected content for a technician", () => {
    setUser({ role: "technician" });
    renderGuardedRoute(TechnicianPrivateRoutes, "/tech-only");
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});

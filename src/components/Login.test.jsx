import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";

// Login.jsx imports the real "axios" package directly (not the shared
// config/axios.js instance), so mocking the module is the clean way to
// control what its login request resolves/rejects with, without needing
// a network layer or touching the app's real interceptor setup.
vi.mock("axios", () => ({
  default: { post: vi.fn() },
}));
import axios from "axios";

function renderLogin() {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login />} />
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

async function fillAndSubmit(user, { email = "ada@example.com", password = "correct-password" } = {}) {
  await user.type(screen.getByPlaceholderText(/john@example.com/i), email);
  await user.type(screen.getByPlaceholderText(/^password$/i), password);
  await user.click(screen.getByRole("button", { name: /login/i }));
}

describe("Login", () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  it("renders the email and password fields", () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
  });

  it("navigates to the customer dashboard and stores only non-secret display data on a successful login", async () => {
    const user = userEvent.setup();
    // Mirrors the real backend post-cookie-migration: the JWT is set as
    // an httpOnly cookie, never returned in the body.
    axios.post.mockResolvedValueOnce({
      data: {
        id: 3,
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@example.com",
        role: "user",
      },
    });

    renderLogin();
    await fillAndSubmit(user);

    expect(await screen.findByText("Customer dashboard")).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem("user"));
    expect(stored.role).toBe("user");
    expect(stored.token).toBeUndefined();
  });

  it("navigates admins to the admin dashboard", async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValueOnce({ data: { id: 1, role: "admin" } });

    renderLogin();
    await fillAndSubmit(user);

    expect(await screen.findByText("Admin dashboard")).toBeInTheDocument();
  });

  it("navigates technicians to the technician dashboard", async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValueOnce({ data: { id: 7, role: "technician" } });

    renderLogin();
    await fillAndSubmit(user);

    expect(await screen.findByText("Technician dashboard")).toBeInTheDocument();
  });

  it("shows the server's error message via alert on a failed login, and stays on the page", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Incorrect password." } },
    });

    renderLogin();
    await fillAndSubmit(user, { password: "wrong-password" });

    expect(await screen.findByRole("button", { name: /^login$/i })).toBeInTheDocument();
    expect(alertSpy).toHaveBeenCalledWith("Incorrect password.");
    expect(localStorage.getItem("user")).toBeNull();

    alertSpy.mockRestore();
  });

  it("disables the submit button and shows a loading label while the request is in flight", async () => {
    const user = userEvent.setup();
    let resolveLogin;
    axios.post.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );

    renderLogin();
    await user.type(screen.getByPlaceholderText(/john@example.com/i), "ada@example.com");
    await user.type(screen.getByPlaceholderText(/^password$/i), "correct-password");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();

    resolveLogin({ data: { id: 3, role: "user" } });
    expect(await screen.findByText("Customer dashboard")).toBeInTheDocument();
  });
});

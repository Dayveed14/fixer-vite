import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";

// A plain function (not a spy) so a rejected promise isn't also tracked
// — and reported as unhandled — by the spy.
const api = vi.hoisted(() => ({ calls: [], impl: async () => ({}) }));
vi.mock("../../api/auth.api", () => ({
  changePassword: (...args) => {
    api.calls.push(args);
    return api.impl(...args);
  },
}));

const changePassword = {
  mockReset: () => {
    api.calls.length = 0;
    api.impl = async () => ({});
  },
  mockResolvedValue: (v) => {
    api.impl = async () => v;
  },
  mockRejectWith: (err) => {
    api.impl = async () => {
      throw err;
    };
  },
};
import ChangePassword, { passwordFormProblem } from "./ChangePassword";
import AccountSettings from "./AccountSettings";

const fill = (current, next, confirm = next) => {
  fireEvent.change(screen.getByLabelText("Current password"), { target: { value: current } });
  fireEvent.change(screen.getByLabelText("New password"), { target: { value: next } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: confirm } });
  fireEvent.click(screen.getByRole("button", { name: "Change password" }));
};

beforeEach(() => changePassword.mockReset());

describe("passwordFormProblem", () => {
  it.each([
    [{ current: "", next: "new-password", confirm: "new-password" }, /current password/],
    [{ current: "old", next: "short", confirm: "short" }, /8 to 72/],
    [{ current: "old", next: "x".repeat(73), confirm: "x".repeat(73) }, /8 to 72/],
    [{ current: "same-pass-1", next: "same-pass-1", confirm: "same-pass-1" }, /haven't just used/],
    [{ current: "old", next: "new-password", confirm: "new-passw0rd" }, /don't match/],
  ])("%#", (form, message) => expect(passwordFormProblem(form)).toMatch(message));

  it("accepts a good change", () => {
    expect(passwordFormProblem({ current: "old-pass", next: "new-password", confirm: "new-password" })).toBeNull();
  });
});

describe("<ChangePassword />", () => {
  it("doesn't call the server when the form is invalid", () => {
    render(<ChangePassword />);
    fill("old-pass", "new-password", "different-1");
    expect(screen.getByRole("alert")).toHaveTextContent("don't match");
    expect(api.calls).toHaveLength(0);
  });

  it("changes the password, confirms and clears the form", async () => {
    changePassword.mockResolvedValue({ message: "Password changed. You've been signed out on other devices." });
    render(<ChangePassword />);
    fill("old-pass-1", "new-password-2");

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("signed out on other devices"));
    expect(api.calls).toEqual([[{ currentPassword: "old-pass-1", newPassword: "new-password-2" }]]);
    expect(screen.getByLabelText("New password")).toHaveValue("");
  });

  it("shows the server's reason when it refuses", async () => {
    changePassword.mockRejectWith(new Error("Your current password is incorrect."));
    render(<ChangePassword />);
    fill("wrong-pass", "new-password-2");
    expect(await screen.findByRole("alert")).toHaveTextContent("incorrect");
  });

  it("can show the passwords", () => {
    render(<ChangePassword />);
    expect(screen.getByLabelText("New password")).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByLabelText("Show passwords"));
    expect(screen.getByLabelText("New password")).toHaveAttribute("type", "text");
  });
});

describe("<AccountSettings /> on every dashboard", () => {
  it.each(["user", "technician", "admin"])("a %s sees their details and the password form", (role) => {
    localStorage.setItem("user", JSON.stringify({ id: 1, first_name: "Ada", last_name: "L", email: "a@b.c", role }));
    render(<AccountSettings />);
    expect(screen.getByText("a@b.c")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change password" })).toBeInTheDocument();
    localStorage.clear();
  });
});

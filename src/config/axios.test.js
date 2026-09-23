import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import "./axios"; // registers the interceptors under test, once, on import

describe("global axios config", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    delete window.location;
    window.location = { pathname: "/dashboard", href: "" };
  });

  afterEach(() => {
    mock.restore();
  });

  it("sends credentials (cookies) with every request", () => {
    expect(axios.defaults.withCredentials).toBe(true);
  });

  it("adds the CSRF client header to mutating requests", async () => {
    mock.onPost("/api/tickets").reply((config) => {
      expect(config.headers["X-Fixer-Client"]).toBe("web");
      return [200, {}];
    });

    await axios.post("/api/tickets", {});
  });

  it("does not add the CSRF header to a GET request", async () => {
    mock.onGet("/api/tickets").reply((config) => {
      expect(config.headers["X-Fixer-Client"]).toBeUndefined();
      return [200, {}];
    });

    await axios.get("/api/tickets");
  });

  it("clears the cached user and redirects to /login on a 401 from a protected endpoint", async () => {
    localStorage.setItem("user", JSON.stringify({ role: "user" }));
    mock.onGet("/api/bookings").reply(401, { message: "Session expired." });

    await expect(axios.get("/api/bookings")).rejects.toBeTruthy();

    expect(localStorage.getItem("user")).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("does NOT clear/redirect on a 401 from the login endpoint itself (that's just a wrong password)", async () => {
    localStorage.setItem("user", JSON.stringify({ role: "user" }));
    mock.onPost("/api/users/login").reply(401, { message: "Incorrect password." });

    await expect(
      axios.post("/api/users/login", { email: "x", password: "y" }),
    ).rejects.toBeTruthy();

    // The cached "user" from a previous session and the current
    // location should be untouched — this 401 is about the credentials
    // just typed in, not an expired session.
    expect(localStorage.getItem("user")).not.toBeNull();
    expect(window.location.href).toBe("");
  });
});

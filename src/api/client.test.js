import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api, { ApiError, API_BASE_URL, DEFAULT_TIMEOUT_MS, toApiError } from "./client";

describe("API client", () => {
  let mock;
  const originalLocation = window.location;

  beforeEach(() => {
    mock = new MockAdapter(api);
    delete window.location;
    window.location = { pathname: "/dashboard", href: "" };
  });

  afterEach(() => {
    mock.restore();
    window.location = originalLocation;
  });

  it("uses one base URL with no trailing slash", () => {
    expect(api.defaults.baseURL).toBe(API_BASE_URL);
    expect(API_BASE_URL.endsWith("/")).toBe(false);
  });

  it("sends credentials (the session cookie) with every request", () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("has a default timeout on every request", () => {
    expect(api.defaults.timeout).toBe(DEFAULT_TIMEOUT_MS);
    expect(DEFAULT_TIMEOUT_MS).toBeGreaterThan(0);
  });

  it("adds the CSRF client header to mutating requests", async () => {
    for (const method of ["post", "put", "patch", "delete"]) {
      mock.onAny("/api/tickets").replyOnce((config) => {
        expect(config.headers["X-Fixer-Client"]).toBe("web");
        return [200, {}];
      });
      await api[method]("/api/tickets", {});
    }
  });

  it("does not add the CSRF header to a GET request", async () => {
    mock.onGet("/api/tickets").reply((config) => {
      expect(config.headers["X-Fixer-Client"]).toBeUndefined();
      return [200, {}];
    });
    await api.get("/api/tickets");
  });

  describe("standardised errors", () => {
    it("rejects with an ApiError carrying the server's message, status and code", async () => {
      mock.onPost("/api/bookings").reply(402, { message: "Payment could not be verified: failed.", code: "PAYMENT_FAILED" });

      const err = await api.post("/api/bookings", {}).catch((e) => e);

      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(402);
      expect(err.code).toBe("PAYMENT_FAILED");
      expect(err.message).toBe("Payment could not be verified: failed.");
      // older call sites still work
      expect(err.response.data.message).toBe("Payment could not be verified: failed.");
    });

    it("falls back to a friendly message when the server sends none", async () => {
      mock.onGet("/api/stats/dashboard").reply(503, "<html>Service Unavailable</html>");
      const err = await api.get("/api/stats/dashboard").catch((e) => e);
      expect(err.status).toBe(503);
      expect(err.message).toMatch(/temporarily unavailable/i);
    });

    it("flags timeouts", async () => {
      mock.onGet("/api/bookings").timeout();
      const err = await api.get("/api/bookings").catch((e) => e);
      expect(err.isTimeout).toBe(true);
      expect(err.code).toBe("TIMEOUT");
      expect(err.message).toMatch(/taking too long/i);
    });

    it("flags network failures", async () => {
      mock.onGet("/api/bookings").networkError();
      const err = await api.get("/api/bookings").catch((e) => e);
      expect(err.isNetworkError).toBe(true);
      expect(err.message).toMatch(/can't reach the server/i);
    });

    it("toApiError is idempotent", () => {
      const original = new ApiError({ message: "x", status: 400 });
      expect(toApiError(original)).toBe(original);
    });
  });

  describe("session expiry", () => {
    it("clears the cached user and redirects to /login on a 401 from a protected endpoint", async () => {
      localStorage.setItem("user", JSON.stringify({ role: "user" }));
      mock.onGet("/api/bookings").reply(401, { message: "Session expired." });

      await expect(api.get("/api/bookings")).rejects.toBeInstanceOf(ApiError);

      expect(localStorage.getItem("user")).toBeNull();
      expect(window.location.href).toBe("/login");
    });

    it("does NOT clear/redirect on a 401 from the login endpoint (that's a wrong password)", async () => {
      localStorage.setItem("user", JSON.stringify({ role: "user" }));
      mock.onPost("/api/users/login").reply(401, { message: "Incorrect password." });

      const err = await api.post("/api/users/login", {}).catch((e) => e);

      expect(err.message).toBe("Incorrect password.");
      expect(localStorage.getItem("user")).not.toBeNull();
      expect(window.location.href).toBe("");
    });

    it("doesn't loop when already on /login", async () => {
      window.location = { pathname: "/login", href: "" };
      mock.onGet("/api/users/me").reply(401, {});
      await api.get("/api/users/me").catch(() => {});
      expect(window.location.href).toBe("");
    });
  });
});

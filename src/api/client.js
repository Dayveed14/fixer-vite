import axios from "axios";

/* ===========================
   API CLIENT — the one way the app talks to the backend.

   Every request goes through this instance, which handles in one place:
   - Base URL: VITE_API_BASE_URL (falls back to the production API), so
     components call relative paths like "/api/bookings".
   - Authentication: the session is an httpOnly cookie set by the backend
     on login. JS never sees the token; `withCredentials` makes the
     browser send the cookie cross-origin.
   - CSRF: mutating requests carry X-Fixer-Client: web, which the
     backend requires whenever a session cookie is present.
   - Timeouts: every request has one (Render's free tier can take a while
     to wake up, so the default is generous). Override per call with
     { timeout } — e.g. FixBot and file uploads.
   - Errors: every failure is rejected as an ApiError with a consistent
     shape ({ status, code, message, isNetworkError, isTimeout }) and a
     human-readable message, so components never parse axios internals.
     `error.response` is kept for older call sites.
   - Session expiry: a 401 from a protected endpoint clears cached user
     info and sends the user to /login.
=========================== */

const FALLBACK_BASE_URL = "https://fixer-backend-7mng.onrender.com";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || FALLBACK_BASE_URL
).replace(/\/+$/, "");

export const DEFAULT_TIMEOUT_MS =
  Number(import.meta.env.VITE_API_TIMEOUT_MS) || 30000;

// Longer budgets for slow-by-nature requests.
export const TIMEOUTS = {
  diagnosis: 45000,
  upload: 120000,
};

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

// Endpoints where a 401 means "wrong credentials", not "session expired".
const AUTH_ENDPOINTS = ["/api/users/login", "/api/users/register"];

export class ApiError extends Error {
  constructor({
    message,
    status = 0,
    code = null,
    data = null,
    isNetworkError = false,
    isTimeout = false,
    response = undefined,
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
    this.isNetworkError = isNetworkError;
    this.isTimeout = isTimeout;
    // Backwards compatibility: older components read err.response.data.message.
    this.response = response;
  }
}

const STATUS_MESSAGES = {
  400: "Some of the information sent was invalid.",
  401: "Please log in to continue.",
  402: "Payment could not be verified.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "That conflicts with an existing record.",
  413: "That request is too large.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again.",
  502: "The server is temporarily unavailable. Please try again.",
  503: "The service is temporarily unavailable. Please try again shortly.",
  504: "The server took too long to respond. Please try again.",
};

/** Converts anything axios can throw into an ApiError. */
export function toApiError(error) {
  if (error instanceof ApiError) return error;

  if (axios.isCancel?.(error) || error?.code === "ERR_CANCELED") {
    return new ApiError({ message: "Request cancelled.", code: "CANCELLED" });
  }

  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return new ApiError({
      message:
        "The server is taking too long to respond. Please check your connection and try again.",
      code: "TIMEOUT",
      isTimeout: true,
    });
  }

  const response = error?.response;

  if (!response) {
    return new ApiError({
      message:
        "Can't reach the server. Please check your internet connection and try again.",
      code: "NETWORK_ERROR",
      isNetworkError: true,
    });
  }

  const data = response.data;
  const serverMessage =
    data && typeof data === "object" && typeof data.message === "string"
      ? data.message
      : null;

  return new ApiError({
    message:
      serverMessage ||
      STATUS_MESSAGES[response.status] ||
      `Request failed (${response.status}).`,
    status: response.status,
    code: (data && typeof data === "object" && data.code) || null,
    data,
    response,
  });
}

/** Reads the cached (non-secret) display info for the logged-in user. */
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

function handleSessionExpired(config) {
  const url = config?.url || "";
  if (AUTH_ENDPOINTS.some((path) => url.includes(path))) return;

  localStorage.removeItem("user");

  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

export function createApiClient(options = {}) {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: DEFAULT_TIMEOUT_MS,
    headers: { Accept: "application/json" },
    ...options,
  });

  instance.interceptors.request.use((config) => {
    if (MUTATING_METHODS.has((config.method || "").toLowerCase())) {
      config.headers = config.headers || {};
      config.headers["X-Fixer-Client"] = "web";
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        handleSessionExpired(error.config);
      }
      return Promise.reject(toApiError(error));
    },
  );

  return instance;
}

const api = createApiClient();

export default api;

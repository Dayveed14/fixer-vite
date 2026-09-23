import axios from "axios";

/**
 * Every file in this app does `import axios from "axios"` and calls it
 * directly — there's no shared instance. Rather than touch every one of
 * those files, we configure the one shared axios singleton here, once,
 * and import this file a single time in main.jsx before anything else
 * runs.
 *
 * Auth now works via an httpOnly cookie the backend sets on login —
 * JavaScript never sees the token, so there's nothing to read out of
 * localStorage and attach manually anymore. `withCredentials: true` is
 * what makes the browser actually send that cookie on cross-origin
 * requests to the API (frontend and backend are on different domains).
 */
axios.defaults.withCredentials = true;

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

axios.interceptors.request.use((config) => {
  // Matches the backend's CSRF guard: a plain cross-site form post can't
  // add a custom header at all, and a cross-site script trying to add
  // one triggers a CORS preflight the backend's origin allowlist blocks.
  // See backend app.js for the other half of this.
  if (MUTATING_METHODS.has((config.method || "").toLowerCase())) {
    config.headers = config.headers || {};
    config.headers["X-Fixer-Client"] = "web";
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session cookie missing/invalid/expired — clear whatever display
      // info we cached locally and send the user back to log in. Skip
      // this on the login/register calls themselves, where a 401 just
      // means "wrong password", not "your session expired".
      const requestUrl = error.config?.url || "";
      const isAuthEndpoint =
        requestUrl.includes("/users/login") ||
        requestUrl.includes("/users/register");

      if (!isAuthEndpoint) {
        localStorage.removeItem("user");

        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default axios;

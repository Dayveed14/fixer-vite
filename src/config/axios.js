import axios from "axios";

/**
 * Every file in this app does `import axios from "axios"` and calls it
 * directly — there's no shared instance. Rather than touch every one of
 * those files, we configure the one shared axios singleton here, once,
 * and import this file a single time in main.jsx before anything else
 * runs. Every axios.get/post/patch/delete call anywhere in the app then
 * automatically carries the logged-in user's token and reacts the same
 * way to an expired/invalid session.
 */

function getStoredToken() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

axios.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token missing/invalid/expired — the stored session is no longer
      // usable, so clear it and send the user back to log in. Skip this
      // on the login/register calls themselves, where a 401 just means
      // "wrong password", not "your session expired".
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

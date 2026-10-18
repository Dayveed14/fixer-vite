import api from "./client";

export const login = (credentials) =>
  api.post("/api/users/login", credentials).then((r) => r.data);

export const register = (details) =>
  api.post("/api/users/register", details).then((r) => r.data);

export const logout = () => api.post("/api/users/logout").then((r) => r.data);

export const getMe = () => api.get("/api/users/me").then((r) => r.data);

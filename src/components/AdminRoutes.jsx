import { Outlet, Navigate } from "react-router-dom";

const AdminRoutes = () => {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const role = user?.role;

  if (role === "admin") {
    return <Outlet />;
  }

  if (role === "technician") {
    return <Navigate to="/techniciandashboard" replace />;
  }

  if (role === "user") {
    return <Navigate to="/userdashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

export default AdminRoutes;
import { Outlet, Navigate } from "react-router-dom";

const TechnicianPrivateRoutes = () => {
  let user = null;

    try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  };

  const role = user?.role;

  if (role === "technician") {
    return <Outlet />;
  }

  if (role === "admin") {
    return <Navigate to="/admindashboard" replace />;
  }

  if (role === "user") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

export default TechnicianPrivateRoutes;

// import { Outlet, Navigate } from "react-router-dom";

// const PrivateRoutes = () => {
//   const user = (() => {
//     try {
//       return JSON.parse(sessionStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   })();
//   const role = user ? user.role : undefined;

//   if (role === "admin") {
//     return <Outlet />;
//   } else if (role) {
//     return <Navigate to="/userhome2" />;
//   } else {
//     return <Navigate to="/" />;
//   }
// };

// export default PrivateRoutes;

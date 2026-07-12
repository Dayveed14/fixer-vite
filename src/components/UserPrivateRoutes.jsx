// import { Outlet, Navigate } from "react-router-dom";

// const UserPrivateRoutes = () => {
//   const user = (() => {
//     try {
//       return JSON.parse(sessionStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   })();
//   const role = user ? user.role : undefined;

//   if (role) {
//     return <Outlet />;
//   } else {
//     return <Navigate to="/" />;
//   }
// };

// export default UserPrivateRoutes;

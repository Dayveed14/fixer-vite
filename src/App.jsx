import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./components/css/App.css";
// import PrivateRoutes from "./components/PrivateRoutes";
// import UserPrivateRoutes from "./components/UserPrivateRoutes";
import BookCall from "./components/BookCall";
import MailIn from "./components/MailIn";
import Shipment from "./components/Shipment";
import Home from "./components/Home";
import Diagnosis from "./components/Diagnosis";
import ScrollToHash from "./components/components/ScrollToHash";
import Login from "./components/Login";
import Register from "./components/Register";
import UserDashboard from "./dashboard/UserDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";
import TechnicianDashboard from "./dashboard/TechnicianDashboard";
import UserLayout from "./dashboard/UserLayout";
function App() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shipment" element={<Shipment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Layout */}
      <Route element={<UserLayout />}>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/techniciandashboard" element={<TechnicianDashboard />} />
        <Route path="/book" element={<BookCall />} />
        <Route path="/mailin" element={<MailIn />} />
        <Route path="/diagnosis" element={<Diagnosis />} />

      </Route>

      </Routes>
      </>
  );
}
export default App;

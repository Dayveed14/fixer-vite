import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./components/css/App.css";
import AdminRoutes from "./components/AdminRoutes";
import UserPrivateRoutes from "./components/UserPrivateRoutes";
import TechnicianPrivateRoutes from "./components/TechnicianPrivateRoutes";
import BookCall from "./components/BookCall";
import MailIn from "./components/MailIn";
import Shipment from "./components/Shipment";
import Home from "./components/Home";
import Diagnosis from "./components/Diagnosis";
import AdminDiagnosis from "./components/AdminDiagnosis";
import ScrollToHash from "./components/components/ScrollToHash";
import Login from "./components/Login";
import Register from "./components/Register";
import UserArticle from "./components/UserArticle";
import UserDashboard from "./dashboard/UserDashboard";
import AdminDashboard from "./dashboard/AdminDashboard";
import TechnicianDashboard from "./dashboard/TechnicianDashboard";
import TechnicianJobs from "./dashboard/TechnicianJobs";
import TechnicianAppointments from "./dashboard/TechnicianAppointments";
import TechnicianRepairs from "./dashboard/TechnicianRepairs";
import TechnicianHistory from "./dashboard/TechnicianHistory";
import TechnicianSettings from "./dashboard/TechnicianSettings";
import UserSettings from "./dashboard/UserSettings";
import AdminSettings from "./dashboard/AdminSettings";
import AdminArticles from "./dashboard/AdminArticles";
import UserLayout from "./dashboard/UserLayout";
import AdminLayout from "./dashboard/AdminLayout";
import TechnicianLayout from "./dashboard/TechnicianLayout";
import RegisterDevice from "./dashboard/RegisterDevice";
import AdminBookings from "./dashboard/AdminBookings";
import AdminTechnicians from "./dashboard/AdminTechnicians";
import AdminUsers from "./dashboard/AdminUsers";
import AdminTickets from "./dashboard/AdminTickets";
import AddArticle from "./dashboard/AddArticle";
import AddUsers from "./dashboard/AddUsers";
import Article from "./dashboard/Article";
import EditArticle from "./dashboard/EditArticle";
import AboutFixer from "./components/AboutFixer"
import Blog from "./components/Blog"
import ContactUs from "./components/ContactUs"
import Community from "./components/Community"
import ShipmentPolicy from "./components/ShipmentPolicy"
import Help from "./components/Help"
import PrivacyPolicy from "./components/PrivacyPolicy"
import Cookies from "./components/Cookies"
function App() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shipment" element={<Shipment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/userarticle/:id" element={<UserArticle />} />
        <Route path="/about"    element={<AboutFixer />} />
        <Route path="/blog"     element={<Blog />} />
        <Route path="/contact"  element={<ContactUs />} />
        <Route path="/community" element={<Community />} />
        <Route path="/shipment-policy" element={<ShipmentPolicy />} />
        <Route path="/help"     element={<Help />} />
        <Route path="/privacy"  element={<PrivacyPolicy />} />
        <Route path="/cookies"  element={<Cookies />} />

        {/* User Layout */}
        <Route element={<UserPrivateRoutes />}>
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/book" element={<BookCall />} />
          <Route path="/mailin" element={<MailIn />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/registerdevice" element={<RegisterDevice />} />
          <Route path="/user/settings" element={<UserSettings />} />

        </Route>
        </Route>
        {/* Technician Layout */}
          <Route element={<TechnicianPrivateRoutes />}>
          <Route element={<TechnicianLayout />}>
              <Route path="/techniciandashboard" element={<TechnicianDashboard />} />
              <Route path="/technician/jobs" element={<TechnicianJobs />} />
              <Route path="/technician/appointments" element={<TechnicianAppointments />} />
              <Route path="/technician/repairs" element={<TechnicianRepairs />} />
              <Route path="/technician/history" element={<TechnicianHistory />} />
              <Route path="/technician/settings" element={<TechnicianSettings />} />
          </Route>
          </Route>
          {/* Admin Layout */}
          <Route element={<AdminRoutes />}>
          <Route element={<AdminLayout />}>
              <Route path="/admindashboard" element={<AdminDashboard />} />
              <Route path="/adminarticles" element={<AdminArticles />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/technicians" element={<AdminTechnicians />} />
          <Route path="/admin/diagnosis" element={<AdminDiagnosis />} />
          <Route path="/admintickets" element={<AdminTickets />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/dashboard/admin/articles/new" element={<AddArticle />} />
          <Route path="/admin/users/new" element={<AddUsers />} />
          <Route path="/article/:id" element={<Article />} />
          <Route path="/admin/editarticle/:id" element={<EditArticle />} />
          <Route path="/adminsettings" element={<AdminSettings />} />

          </Route>
</Route>

        </Routes>
      </>
  );
}
export default App;

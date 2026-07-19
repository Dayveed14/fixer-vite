// TechnicianRepairs.jsx
// Repairs — reserved for mail-in devices tracked via shipments.
// Intentionally a shell: the Shipment model doesn't exist in the backend yet
// (routes/Shipment.route.js is commented out in app.js). Once it's built,
// this page will list mail-in jobs the same way TechnicianJobs.jsx lists
// tickets, filtered to the mail-in channel.

import { FaBoxOpen } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./TechnicianShared.css";

const TechnicianRepairs = () => {
  return (
    <div className="tech-page">

      <div className="tech-page-header">
        <div>
          <h1>Repairs</h1>
          <p>Mail-in devices shipped to us for repair.</p>
        </div>
      </div>

      <div className="tech-shell">
        <span className="badge">Coming Soon</span>
        <div className="tech-shell-icon">
          <FaBoxOpen />
        </div>
        <h2>Mail-in tracking isn't built yet</h2>
        <p>
          Once shipment tracking goes live, devices customers mail in will
          show up here — with tracking number, carrier, and received date —
          separate from your remote-support appointments. Until then, any
          mail-in jobs you're assigned will appear in{" "}
          <Link to="/technician/jobs">Assigned Jobs</Link>.
        </p>
      </div>

    </div>
  );
};

export default TechnicianRepairs;

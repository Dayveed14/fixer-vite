import { getStoredUser } from "../../api/client";
import ChangePassword from "./ChangePassword";
import "../../dashboard/TechnicianShared.css";
import "./account.css";

const ROLE_LABELS = { user: "Customer", technician: "Technician", admin: "Admin" };

/** Settings page shared by the customer, technician and admin dashboards. */
export default function AccountSettings() {
  const user = getStoredUser();

  if (!user) {
    return (
      <div className="tech-page">
        <p className="dashboard-error">You need to be logged in to view settings.</p>
      </div>
    );
  }

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
  const role = ROLE_LABELS[user.role] || user.role;

  return (
    <div className="tech-page">
      <div className="tech-page-header">
        <div>
          <h1>Settings</h1>
          <p>Your account details and password.</p>
        </div>
      </div>

      <div className="account-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar">{initials || "?"}</div>
            <div>
              <h2>
                {user.first_name} {user.last_name}
              </h2>
              <p>{role}</p>
            </div>
          </div>

          <div className="profile-field">
            <span>Email</span>
            <strong>{user.email || "—"}</strong>
          </div>

          <div className="profile-field">
            <span>Phone</span>
            <strong>{user.phone || "—"}</strong>
          </div>

          <div className="profile-field">
            <span>Role</span>
            <strong>{role}</strong>
          </div>

          <p className="profile-note">
            {user.role === "admin"
              ? "To change your name or phone, update it in the database or ask another admin."
              : "To change your name or phone number, contact support or an admin."}
          </p>
        </div>

        <ChangePassword />
      </div>
    </div>
  );
}

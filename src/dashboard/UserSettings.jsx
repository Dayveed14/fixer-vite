// UserSettings.jsx
// Read-only profile view for now — there's no user-update endpoint in the
// backend yet (User.route.js only has register/login/create/technicians/users).
// Wire this up to a real PATCH /api/users/:id once that endpoint exists.

import "./TechnicianShared.css";

const UserSettings = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!user) {
    return (
      <div className="tech-page">
        <p className="dashboard-error">You need to be logged in to view settings.</p>
      </div>
    );
  }

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="tech-page">

      <div className="tech-page-header">
        <div>
          <h1>Settings</h1>
          <p>Your account details.</p>
        </div>
      </div>

      <div className="profile-card">

        <div className="profile-card-header">
          <div className="profile-avatar">{initials || "?"}</div>
          <div>
            <h2>{user.first_name} {user.last_name}</h2>
            <p>{user.role}</p>
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
          <strong style={{ textTransform: "capitalize" }}>{user.role}</strong>
        </div>

        <p className="profile-note">
          Profile editing isn't available yet. Reach out to an admin if any of these details need to change.
        </p>

      </div>

    </div>
  );
};

export default UserSettings;

import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import api from "../api/client";
import "./AddUsers.css";

/**
 * Admin: edit a customer's or technician's name, phone and role.
 * Used by /admin/users/edit/:id and /admin/technicians/edit/:id.
 * Changing someone's role signs them out so the change takes effect.
 */
const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backTo = useLocation().pathname.startsWith("/admin/technicians") ? "/admin/technicians" : "/admin/users";

  const [form, setForm] = useState(null);
  const [originalRole, setOriginalRole] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/api/users/${encodeURIComponent(id)}`)
      .then(({ data }) => {
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          role: data.role,
          email: data.email,
        });
        setOriginalRole(data.role);
      })
      .catch((err) => setError(err.message || "Couldn't load this account."));
  }, [id]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/api/users/${encodeURIComponent(id)}`, {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        role: form.role,
      });
      navigate(backTo);
    } catch (err) {
      setError(err.message || "Couldn't save the changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-user-container">
      <div className="add-user-card">
        <div className="add-user-header">
          <h2>Edit account</h2>
        </div>

        <div className="add-user-body">
          {error && <div className="alert alert-info" role="alert">{error}</div>}

          {!form && !error && <p>Loading…</p>}

          {form && (
            <form onSubmit={save}>
              <div className="form-group">
                <label htmlFor="eu-email">Email</label>
                <input id="eu-email" className="form-control" value={form.email} disabled />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="eu-first">First name</label>
                  <input id="eu-first" name="first_name" className="form-control" value={form.first_name} onChange={change} required maxLength={80} />
                </div>
                <div className="form-group">
                  <label htmlFor="eu-last">Last name</label>
                  <input id="eu-last" name="last_name" className="form-control" value={form.last_name} onChange={change} required maxLength={80} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="eu-phone">Phone</label>
                <input id="eu-phone" name="phone" className="form-control" value={form.phone} onChange={change} maxLength={30} />
              </div>

              <div className="form-group">
                <label htmlFor="eu-role">Role</label>
                <select id="eu-role" name="role" className="form-select" value={form.role} onChange={change}>
                  <option value="user">Customer</option>
                  <option value="technician">Technician</option>
                </select>
                {form.role !== originalRole && (
                  <small>They'll be signed out and need to log in again to get the new access.</small>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>{" "}
              <Link to={backTo}>Cancel</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditUser;

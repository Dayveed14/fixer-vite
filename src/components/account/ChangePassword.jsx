import { useId, useState } from "react";
import { changePassword } from "../../api/auth.api";
import "./account.css";

const MIN = 8;
const MAX = 72;
const byteLength = (s) => new TextEncoder().encode(s).length;

/** Same rules the server applies, so most mistakes are caught before sending. */
export function passwordFormProblem({ current, next, confirm }) {
  if (!current) return "Enter your current password.";
  if (next.length < MIN || byteLength(next) > MAX) return `Your new password must be ${MIN} to ${MAX} characters.`;
  if (next === current) return "Choose a password you haven't just used.";
  if (next !== confirm) return "The new passwords don't match.";
  return null;
}

export default function ChangePassword() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError(null);
    setDone(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = passwordFormProblem(form);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await changePassword({ currentPassword: form.current, newPassword: form.next });
      setDone(res?.message || "Password changed.");
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setError(err?.message || "Couldn't change your password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const id = useId();
  const type = show ? "text" : "password";
  const nextLen = form.next.length;

  return (
    <form className="account-card" onSubmit={submit} noValidate>
      <div className="account-card__head">
        <h2>Change password</h2>
        <p>Changing it signs you out on every other device.</p>
      </div>

      <div className="account-field">
        <label htmlFor={`${id}-current`}>Current password</label>
        <input
          id={`${id}-current`}
          type={type}
          autoComplete="current-password"
          value={form.current}
          onChange={update("current")}
        />
      </div>

      <div className="account-field">
        <label htmlFor={`${id}-next`}>New password</label>
        <input
          id={`${id}-next`}
          type={type}
          autoComplete="new-password"
          value={form.next}
          onChange={update("next")}
          aria-describedby={`${id}-hint`}
        />
        <small id={`${id}-hint`} className={nextLen && nextLen < MIN ? "is-short" : ""}>
          At least {MIN} characters{nextLen ? ` (${nextLen} so far)` : ""}.
        </small>
      </div>

      <div className="account-field">
        <label htmlFor={`${id}-confirm`}>Confirm new password</label>
        <input
          id={`${id}-confirm`}
          type={type}
          autoComplete="new-password"
          value={form.confirm}
          onChange={update("confirm")}
        />
      </div>

      <label className="account-check">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
        Show passwords
      </label>

      {error && (
        <p className="account-msg account-msg--error" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="account-msg account-msg--ok" role="status">
          {done}
        </p>
      )}

      <button type="submit" className="account-btn" disabled={saving}>
        {saving ? "Changing password…" : "Change password"}
      </button>
    </form>
  );
}

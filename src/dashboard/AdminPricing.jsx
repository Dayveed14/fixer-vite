import { useEffect, useMemo, useState } from "react";
import { getPricing, saveSettings, saveSupportTypes, saveZones } from "../api/pricing.api";
import { naira } from "../utils/shipmentStatus";
import "./AdminArticles.css";
import "./AdminPricing.css";

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);

export function feeFromRateCard(km, s) {
  const raw = Number(s.base_fee) + Number(s.per_km) * Number(km);
  const step = Number(s.round_to) || 1;
  return Math.max(Number(s.min_fee), Math.ceil(raw / step) * step);
}

function SaveBar({ onSave, saving, message, error, label }) {
  return (
    <div className="pricing-savebar">
      <button className="shp-btn" onClick={onSave} disabled={saving}>
        {saving ? "Saving…" : label}
      </button>
      {message && <span className="pricing-ok" role="status">{message}</span>}
      {error && <span className="pricing-err" role="alert">{error}</span>}
    </div>
  );
}

function useSaver(fn) {
  const [state, setState] = useState({ saving: false, message: null, error: null });
  const run = async (...args) => {
    setState({ saving: true, message: null, error: null });
    try {
      const result = await fn(...args);
      setState({ saving: false, message: result?.message || "Saved", error: null });
      return result;
    } catch (err) {
      setState({ saving: false, message: null, error: err.message });
      return null;
    }
  };
  return [state, run];
}

export default function AdminPricing() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [types, setTypes] = useState([]);
  const [zones, setZones] = useState([]);
  const [settings, setSettings] = useState(null);
  const [newZone, setNewZone] = useState({ name: "", group: "", distanceKm: "" });

  const [typesState, runSaveTypes] = useSaver((items) => saveSupportTypes(items));
  const [zonesState, runSaveZones] = useSaver((list) => saveZones(list));
  const [settingsState, runSaveSettings] = useSaver((s) => saveSettings(s));

  useEffect(() => {
    getPricing()
      .then((data) => {
        setTypes(data.support_types);
        setZones(data.zones);
        setSettings(data.settings);
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => [...new Set(zones.map((z) => z.group))], [zones]);

  const updateZone = (id, patch) =>
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)));

  const applyRateCard = () =>
    setZones((prev) => prev.map((z) => ({ ...z, fee: feeFromRateCard(z.distanceKm, settings) })));

  const addZone = (e) => {
    e.preventDefault();
    const id = slugify(newZone.name);
    if (!id || zones.some((z) => z.id === id)) return;
    const km = Number(newZone.distanceKm) || 0;
    setZones((prev) => [
      ...prev,
      {
        id,
        name: newZone.name.trim(),
        group: newZone.group.trim() || "Other",
        distanceKm: km,
        fee: feeFromRateCard(km, settings),
        active: true,
      },
    ]);
    setNewZone({ name: "", group: newZone.group, distanceKm: "" });
  };

  if (loading) return <p>Loading prices…</p>;
  if (loadError) return <p className="shp-error" role="alert">{loadError}</p>;

  return (
    <div className="admin-articles pricing">
      <div className="admin-articles-header">
        <div>
          <h1>Pricing</h1>
          <p>
            What customers pay. Changes apply to new payments immediately; payments already started
            keep the price they were given.
          </p>
        </div>
      </div>

      {/* Call prices */}
      <section className="pricing-section" aria-labelledby="pricing-calls">
        <h2 id="pricing-calls">Expert call prices</h2>
        <div className="pricing-types">
          {types.map((t) => (
            <label key={t.id} className="pricing-type">
              <span>{t.title}</span>
              <span className="pricing-money">
                ₦
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={t.amount}
                  onChange={(e) =>
                    setTypes((prev) =>
                      prev.map((x) => (x.id === t.id ? { ...x, amount: e.target.value } : x)),
                    )
                  }
                />
              </span>
            </label>
          ))}
        </div>
        <SaveBar
          label="Save call prices"
          {...typesState}
          onSave={() => runSaveTypes(types.map((t) => ({ id: t.id, amount: Number(t.amount) })))}
        />
      </section>

      {/* Rate card + rules */}
      <section className="pricing-section" aria-labelledby="pricing-rules">
        <h2 id="pricing-rules">Pickup rate card and delivery rules</h2>
        <p className="pricing-help">
          Suggested pickup fee = {naira(settings.base_fee)} + {naira(settings.per_km)} per km from Wuse,
          rounded up to {naira(settings.round_to)}, minimum {naira(settings.min_fee)}.
        </p>
        <div className="pricing-grid">
          {[
            ["base_fee", "Base fee (₦)"],
            ["per_km", "Per km (₦)"],
            ["round_to", "Round up to (₦)"],
            ["min_fee", "Minimum fee (₦)"],
            ["delivery_confirm_hours", "Hours to confirm delivery"],
          ].map(([key, label]) => (
            <label key={key} className="shp-field">
              <span>{label}</span>
              <input
                type="number"
                min="0"
                value={settings[key]}
                onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        <label className="pricing-check">
          <input
            type="checkbox"
            checked={Boolean(settings.charge_return_on_decline)}
            onChange={(e) => setSettings((s) => ({ ...s, charge_return_on_decline: e.target.checked }))}
          />
          Customers who decline a repair pay the return delivery fee
        </label>
        <SaveBar
          label="Save rules"
          {...settingsState}
          onSave={() =>
            runSaveSettings({
              base_fee: Number(settings.base_fee),
              per_km: Number(settings.per_km),
              round_to: Number(settings.round_to),
              min_fee: Number(settings.min_fee),
              delivery_confirm_hours: Number(settings.delivery_confirm_hours),
              charge_return_on_decline: Boolean(settings.charge_return_on_decline),
            })
          }
        />
      </section>

      {/* Zones */}
      <section className="pricing-section" aria-labelledby="pricing-zones">
        <div className="pricing-section__head">
          <h2 id="pricing-zones">Pickup areas</h2>
          <button className="shp-btn shp-btn--ghost" onClick={applyRateCard}>
            Recalculate fees from rate card
          </button>
        </div>
        <p className="pricing-help">
          Fees here are charged for pickup and again for return delivery. Turn an area off to stop offering
          it; it stays on past shipments.
        </p>

        <div className="admin-table-wrapper">
          <table className="admin-table pricing-zones">
            <thead>
              <tr>
                <th>Area</th>
                <th>Group</th>
                <th>Km to Wuse</th>
                <th>Fee (₦)</th>
                <th>Offered</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className={z.active ? "" : "pricing-off"}>
                  <td>
                    <input
                      aria-label={`${z.name} name`}
                      value={z.name}
                      onChange={(e) => updateZone(z.id, { name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`${z.name} group`}
                      list="pricing-groups"
                      value={z.group}
                      onChange={(e) => updateZone(z.id, { group: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`${z.name} distance`}
                      type="number"
                      min="0"
                      value={z.distanceKm}
                      onChange={(e) => updateZone(z.id, { distanceKm: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`${z.name} fee`}
                      type="number"
                      min="0"
                      step="100"
                      value={z.fee}
                      onChange={(e) => updateZone(z.id, { fee: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`Offer ${z.name}`}
                      type="checkbox"
                      checked={Boolean(z.active)}
                      onChange={(e) => updateZone(z.id, { active: e.target.checked })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id="pricing-groups">
            {groups.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>

        <form className="pricing-add" onSubmit={addZone}>
          <input
            aria-label="New area name"
            placeholder="New area, e.g. Jikwoyi"
            value={newZone.name}
            onChange={(e) => setNewZone((n) => ({ ...n, name: e.target.value }))}
          />
          <input
            aria-label="New area group"
            placeholder="Group"
            list="pricing-groups"
            value={newZone.group}
            onChange={(e) => setNewZone((n) => ({ ...n, group: e.target.value }))}
          />
          <input
            aria-label="New area distance"
            placeholder="Km"
            type="number"
            min="0"
            value={newZone.distanceKm}
            onChange={(e) => setNewZone((n) => ({ ...n, distanceKm: e.target.value }))}
          />
          <button className="shp-btn shp-btn--ghost" type="submit" disabled={!newZone.name.trim()}>
            Add area
          </button>
        </form>

        <SaveBar
          label="Save pickup areas"
          {...zonesState}
          onSave={() =>
            runSaveZones(
              zones.map((z) => ({
                id: z.id,
                name: z.name,
                group: z.group,
                distanceKm: Number(z.distanceKm),
                fee: Number(z.fee),
                active: Boolean(z.active),
              })),
            )
          }
        />
      </section>
    </div>
  );
}

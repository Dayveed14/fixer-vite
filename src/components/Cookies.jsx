import { useState } from "react";
import "./css/StaticPage.css";
import Navbar from "./components/Navbar";

const COOKIE_TYPES = [
  {
    name: "Essential cookies",
    required: true,
    desc: "These cookies are necessary for the platform to function and cannot be switched off. They are set in response to actions you take such as logging in, filling forms, or setting privacy preferences.",
    examples: ["Session authentication", "CSRF protection tokens", "Cookie consent preferences"],
  },
  {
    name: "Analytics cookies",
    required: false,
    desc: "These help us understand how visitors interact with the platform — which pages are most visited, where users drop off, and how features are being used. All data is anonymised.",
    examples: ["Page view tracking", "Feature usage data", "Error reporting"],
  },
  {
    name: "Functional cookies",
    required: false,
    desc: "These cookies allow the platform to remember choices you make (such as your preferred language or region) and provide enhanced, personalised features.",
    examples: ["Language preferences", "Theme settings", "Last-viewed device or guide"],
  },
  {
    name: "Marketing cookies",
    required: false,
    desc: "We currently do not run advertising campaigns that require tracking cookies. If this changes in future, we will update this policy and request your consent before placing any marketing cookies.",
    examples: ["None currently active"],
  },
];

export default function Cookies() {
  const [prefs, setPrefs] = useState({ analytics: true, functional: true, marketing: false });
  const [saved, setSaved] = useState(false);

  const handleSave = () => setSaved(true);

  return (
    <div className="static-page">
<Navbar />
      <section className="static-hero">
        <p className="static-hero__eyebrow">Legal</p>
        <h1 className="static-hero__title">Cookies Policy</h1>
        <p className="static-hero__sub">Last updated: July 2026</p>
      </section>

      <section className="static-section">
        <div className="static-section__inner static-section__inner--narrow">

          <div className="policy-intro">
            <p>
              Fixer uses cookies and similar technologies to keep the platform running, understand how it's used,
              and remember your preferences. This page explains what each type does and lets you manage your choices.
            </p>
          </div>

          {/* Cookie types */}
          <div className="cookies-list">
            {COOKIE_TYPES.map(ct => (
              <div className="cookie-item" key={ct.name}>
                <div className="cookie-item__header">
                  <div>
                    <h3 className="cookie-item__name">{ct.name}</h3>
                    <span className={`cookie-item__badge ${ct.required ? "required" : ""}`}>
                      {ct.required ? "Always active" : "Optional"}
                    </span>
                  </div>
                  {!ct.required && (
                    <label className="cookie-toggle">
                      <input
                        type="checkbox"
                        checked={prefs[ct.name.split(" ")[0].toLowerCase()]}
                        onChange={e => {
                          const key = ct.name.split(" ")[0].toLowerCase();
                          setPrefs(p => ({ ...p, [key]: e.target.checked }));
                          setSaved(false);
                        }}
                      />
                      <span className="cookie-toggle__slider" />
                    </label>
                  )}
                </div>
                <p className="cookie-item__desc">{ct.desc}</p>
                <div className="cookie-item__examples">
                  <span className="cookie-item__examples-label">Examples:</span>
                  {ct.examples.map(ex => (
                    <span className="cookie-item__tag" key={ex}>{ex}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save preferences */}
          <div className="cookies-save">
            {saved
              ? <p className="cookies-save__success">✓ Your preferences have been saved.</p>
              : <button className="cookies-save__btn" onClick={handleSave}>Save my preferences</button>
            }
          </div>

          {/* What are cookies */}
          <div className="policy-sections">
            <div className="policy-section">
              <h2 className="policy-section__title">What are cookies?</h2>
              <p className="policy-section__body">
                Cookies are small text files placed on your device by websites you visit. They are widely used
                to make websites work efficiently and to provide information to the site owner.
              </p>
            </div>
            <div className="policy-section">
              <h2 className="policy-section__title">How to manage cookies in your browser</h2>
              <p className="policy-section__body">
                You can also control cookies through your browser settings. Most browsers allow you to block
                or delete cookies. Note that disabling certain cookies may affect the functionality of Fixer.
                Refer to your browser's help documentation for specific instructions.
              </p>
            </div>
            <div className="policy-section">
              <h2 className="policy-section__title">Changes to this policy</h2>
              <p className="policy-section__body">
                We may update this Cookies Policy as our platform evolves. We will notify you of material
                changes through the platform or by email.
              </p>
            </div>
          </div>

          <div className="policy-contact">
            <p>Questions about our use of cookies?</p>
            <a href="/contact" className="policy-contact__link">Contact us →</a>
          </div>

        </div>
      </section>

    </div>
  );
}

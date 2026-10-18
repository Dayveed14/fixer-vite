import { useId } from "react";

/**
 * Decorative circuit-board traces: right-angled copper lines, solder
 * pads and a chip, with a cyan "signal" travelling along the main
 * trace. Purely visual (aria-hidden). Motion stops for people who
 * prefer reduced motion (see styles/tech.css).
 *
 * tone: "light" (white traces, for blue banners) | "brand" (blue traces,
 * for white/light surfaces).
 */
export default function CircuitArt({ tone = "light", className = "" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`circuit-art circuit-art--${tone} ${className}`}
      viewBox="0 0 420 220"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
      focusable="false">
      <defs>
        <linearGradient id={`fade-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.35" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>

      <g className="circuit-art__traces" fill="none" stroke={`url(#fade-${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 40 H150 L175 65 H260 V30 H330" />
        <path d="M60 110 H190 L210 90 H255" />
        <path d="M0 160 H120 L140 180 H230 V140 H262" />
        <path d="M330 30 H380 V70" />
        <path d="M340 150 H400 V190 H360" />
        <path d="M300 205 V180 H340" />
      </g>

      {/* chip */}
      <g className="circuit-art__chip">
        <rect x="262" y="78" width="78" height="78" rx="10" />
        {[92, 106, 120, 134].map((y) => (
          <g key={y}>
            <line x1="255" y1={y} x2="262" y2={y} />
            <line x1="340" y1={y} x2="347" y2={y} />
          </g>
        ))}
        <circle cx="301" cy="117" r="13" className="circuit-art__core" />
      </g>

      {/* solder pads */}
      <g className="circuit-art__pads">
        {[
          [150, 40], [260, 30], [380, 70], [210, 90], [120, 160], [230, 180], [400, 190], [360, 190], [300, 205], [60, 110],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" />
        ))}
      </g>

      {/* the travelling signal */}
      <path
        className="circuit-art__signal"
        d="M20 40 H150 L175 65 H260 V30 H330 H380 V70"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength="100"
      />
      <path
        className="circuit-art__signal circuit-art__signal--late"
        d="M0 160 H120 L140 180 H230 V140 H262"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength="100"
      />
    </svg>
  );
}

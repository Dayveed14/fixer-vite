import CircuitArt from "./CircuitArt";

/**
 * A generated cover for an article or video without an image: the
 * category on a blueprint grid with circuit traces, instead of an empty
 * box or a broken image.
 */
export default function TechCover({ category, title, className = "" }) {
  return (
    <div className={`tech-cover ${className}`} role="img" aria-label={title ? `Cover for ${title}` : "Fixer article cover"}>
      <CircuitArt tone="light" className="tech-cover__art" />
      <span className="tech-cover__label">{category || "Fixer guide"}</span>
    </div>
  );
}

import { useState } from "react";
import TechCover from "./TechCover";

/** An article/video image that falls back to a generated cover if it's missing or fails to load. */
export default function CoverImage({ src, alt, className, coverClassName = "", category, title }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <TechCover category={category} title={title || alt} className={coverClassName} />;
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

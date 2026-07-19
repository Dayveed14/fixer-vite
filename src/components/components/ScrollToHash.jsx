import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // No hash? Scroll to top on every page change.
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", // or omit this line
      });
      return;
    }

    // Hash exists - scroll to that section.
    const timer = setTimeout(() => {
      const element = document.querySelector(hash);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
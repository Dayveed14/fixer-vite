// Makes a table row behave like a link: click or Enter opens `to`.
// Clicks on real buttons/links inside the row (e.g. rating stars) are
// left alone.
export function rowLink(navigate, to) {
  const go = (e) => {
    if (e.target.closest?.("button, a, input, select, textarea, [data-no-row-link]")) return;
    navigate(to);
  };
  return {
    role: "link",
    tabIndex: 0,
    className: "row-link",
    onClick: go,
    onKeyDown: (e) => {
      if (e.key === "Enter") go(e);
    },
  };
}

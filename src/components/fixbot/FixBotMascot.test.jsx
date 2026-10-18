import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FixBotMascot from "./FixBotMascot";

describe("FixBot mascot", () => {
  it.each([
    ["idle", /dancing/],
    ["thinking", /thinking/],
    ["happy", /celebrating/],
    ["puzzled", /puzzled/],
  ])("%s mood is described for screen readers", (mood, label) => {
    const { container } = render(<FixBotMascot mood={mood} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(label);
    expect(container.firstChild).toHaveClass(`fixbot--${mood}`);
  });

  it("wears the Fixer logo", () => {
    const { container } = render(<FixBotMascot />);
    expect(container.querySelector("text").textContent).toBe("fixer");
  });
});

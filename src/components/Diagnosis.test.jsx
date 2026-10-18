import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Diagnosis from "./Diagnosis";

vi.mock("../api/diagnosis.api", () => ({ runDiagnosis: vi.fn() }));
import { runDiagnosis } from "../api/diagnosis.api";

async function runWith(response) {
  const user = userEvent.setup();
  if (response instanceof Error) runDiagnosis.mockRejectedValueOnce(response);
  else runDiagnosis.mockResolvedValueOnce(response);

  render(
    <MemoryRouter>
      <Diagnosis />
    </MemoryRouter>,
  );
  await user.type(screen.getByPlaceholderText(/water damage/i), "Overheating");
  await user.click(screen.getByRole("button", { name: /run diagnostic/i }));
  return user;
}

describe("FixBot rendering", () => {
  beforeEach(() => runDiagnosis.mockReset());

  it("renders knowledge-base results", async () => {
    await runWith({
      success: true,
      source: "knowledge_base",
      requestId: 1,
      results: [{ id: 7, primary_fault: "Dusty cooling fan", severity: "medium", confidence: 80 }],
    });
    expect(await screen.findByText("Dusty cooling fan")).toBeInTheDocument();
    expect(screen.queryByText(/AI Diagnosis/i)).not.toBeInTheDocument();
  });

  it("renders an AI diagnosis with a naira estimate shown as-is", async () => {
    await runWith({
      success: true,
      source: "ai",
      requestId: 2,
      likelyProblem: "Failing thermal paste",
      confidence: 64,
      severity: "high",
      causes: ["Old paste"],
      steps: ["Re-apply thermal paste"],
      estimatedRepair: "₦15,000",
      bookTechnician: true,
      mailInRepair: false,
    });
    expect(await screen.findByText("Failing thermal paste")).toBeInTheDocument();
    expect(screen.getByText("₦15,000")).toBeInTheDocument();
    expect(screen.getByText("Re-apply thermal paste")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /book remote support/i })).toBeInTheDocument();
  });

  it("renders the no-match answer with a way forward", async () => {
    await runWith({
      success: true,
      source: "no_match",
      requestId: 3,
      reason: "ai_unavailable",
      message: "Our AI assistant is unavailable right now.",
      suggestions: [{ id: 9, primary_fault: "Fan noise" }],
    });
    expect(await screen.findByTestId("diagnosis-no-match")).toBeInTheDocument();
    expect(screen.getByText(/AI assistant is unavailable/)).toBeInTheDocument();
    expect(screen.getByText("Fan noise")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mail-in repair/i })).toBeInTheDocument();
  });

  it("treats a malformed AI payload as no-match instead of rendering blanks", async () => {
    await runWith({ success: true, source: "ai" });
    expect(await screen.findByTestId("diagnosis-no-match")).toBeInTheDocument();
  });

  it("shows the API error (e.g. rate limit) instead of an empty modal", async () => {
    await runWith(Object.assign(new Error("You've run a lot of diagnoses in a short time."), { status: 429 }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/a lot of diagnoses/);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

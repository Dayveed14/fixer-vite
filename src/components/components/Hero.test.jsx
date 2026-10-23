import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("../../api/bookings.api", () => ({
  getSupportTypes: vi.fn(async () => [
    { id: "voice", title: "Voice Call", amount: 5000 },
    { id: "video", title: "Video Call", amount: 7000 },
  ]),
}));
vi.mock("../../api/shipments.api", () => ({
  getDispatchZones: vi.fn(async () => ({ zones: [{ id: "wuse", fee: 1500 }, { id: "garki", fee: 2000 }] })),
}));
vi.mock("../../api/diagnosis.api", () => ({ runDiagnosis: vi.fn() }));

import Hero from "./Hero";

beforeEach(() => {
  // Skip the scan animation delay.
  window.matchMedia = vi.fn(() => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
});

const renderHero = () =>
  render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>,
  );

it("shows live starting prices from the pricing engine", async () => {
  renderHero();
  expect(await screen.findByText(/from ₦5,000/)).toBeInTheDocument();
  expect(screen.getByText(/Pickup from 2 areas in Abuja · from ₦1,500/)).toBeInTheDocument();
});

it("falls back to plain copy when prices can't load", async () => {
  const { getSupportTypes } = await import("../../api/bookings.api");
  const { getDispatchZones } = await import("../../api/shipments.api");
  getSupportTypes.mockRejectedValueOnce(new Error("offline"));
  getDispatchZones.mockRejectedValueOnce(new Error("offline"));
  renderHero();
  expect(await screen.findByText("Pickup across Abuja")).toBeInTheDocument();
  expect(screen.queryByText(/₦/)).not.toBeInTheDocument();
});

it("picking a symptom scans and lists the usual causes, then opens FixBot pre-filled", async () => {
  renderHero();
  const chip = screen.getByRole("button", { name: "Won't charge" });
  fireEvent.click(chip);
  expect(chip).toHaveAttribute("aria-pressed", "true");

  expect(await screen.findByText("Worn charging port or DC jack")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Get a full diagnosis" }));

  await waitFor(() => expect(screen.getByText(/Describe your device and its symptoms/)).toBeInTheDocument());
  const symptom = screen.getAllByRole("button", { name: "Won't charge" }).find((b) => b !== chip);
  expect(symptom).toBeTruthy();
  expect(screen.getAllByText("Laptop").length).toBeGreaterThan(0);
});

it("routes link to booking and pickup", () => {
  renderHero();
  expect(screen.getByRole("link", { name: /Send it in for repair/ })).toHaveAttribute("href", "/shipment");
  expect(screen.getAllByRole("link", { name: /Talk to a technician/ })[0]).toHaveAttribute("href", "/book");
});

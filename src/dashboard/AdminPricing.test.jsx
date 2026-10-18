import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPricing, { feeFromRateCard } from "./AdminPricing";

vi.mock("../api/pricing.api", () => ({
  getPricing: vi.fn(),
  saveSupportTypes: vi.fn(),
  saveZones: vi.fn(),
  saveSettings: vi.fn(),
}));
import { getPricing, saveSupportTypes, saveZones, saveSettings } from "../api/pricing.api";

const settings = { base_fee: 1000, per_km: 150, min_fee: 1500, round_to: 500, delivery_confirm_hours: 12, charge_return_on_decline: true };

beforeEach(() => {
  [getPricing, saveSupportTypes, saveZones, saveSettings].forEach((m) => m.mockReset());
  getPricing.mockResolvedValue({
    support_types: [
      { id: "voice", title: "Voice Call", amount: 5000 },
      { id: "video", title: "Video Call", amount: 7000 },
      { id: "remote", title: "Remote Support", amount: 10000 },
    ],
    zones: [
      { id: "garki", name: "Garki", group: "City centre", distanceKm: 5, fee: 2000, active: true },
      { id: "kubwa", name: "Kubwa", group: "Satellite towns", distanceKm: 22, fee: 9999, active: true },
    ],
    settings,
  });
});

it("feeFromRateCard matches the backend formula", () => {
  expect(feeFromRateCard(22, settings)).toBe(4500);
  expect(feeFromRateCard(0, settings)).toBe(1500);
});

describe("admin pricing page", () => {
  it("saves new call prices", async () => {
    saveSupportTypes.mockResolvedValueOnce({ message: "Call prices updated" });
    const user = userEvent.setup();
    render(<AdminPricing />);
    const voice = await screen.findByLabelText(/voice call/i);
    await user.clear(voice);
    await user.type(voice, "6000");
    await user.click(screen.getByRole("button", { name: /save call prices/i }));
    expect(saveSupportTypes).toHaveBeenCalledWith([
      { id: "voice", amount: 6000 },
      { id: "video", amount: 7000 },
      { id: "remote", amount: 10000 },
    ]);
    expect(await screen.findByRole("status")).toHaveTextContent("Call prices updated");
  });

  it("recalculates fees from the rate card, adds an area and saves zones", async () => {
    saveZones.mockResolvedValueOnce({ message: "Pickup areas updated" });
    const user = userEvent.setup();
    render(<AdminPricing />);
    await user.click(await screen.findByRole("button", { name: /recalculate fees/i }));
    expect(screen.getByLabelText("Kubwa fee")).toHaveValue(4500);

    await user.type(screen.getByLabelText("New area name"), "Jikwoyi");
    await user.type(screen.getByLabelText("New area group"), "Satellite towns");
    await user.type(screen.getByLabelText("New area distance"), "25");
    await user.click(screen.getByRole("button", { name: /add area/i }));
    await user.click(screen.getByLabelText("Offer Garki"));
    await user.click(screen.getByRole("button", { name: /save pickup areas/i }));

    const zones = saveZones.mock.calls[0][0];
    expect(zones.find((z) => z.id === "jikwoyi")).toEqual({ id: "jikwoyi", name: "Jikwoyi", group: "Satellite towns", distanceKm: 25, fee: 5000, active: true });
    expect(zones.find((z) => z.id === "garki").active).toBe(false);
  });

  it("shows the server's validation message", async () => {
    saveSettings.mockRejectedValueOnce(new Error("delivery_confirm_hours must be between 1 and 72."));
    const user = userEvent.setup();
    render(<AdminPricing />);
    const hours = await screen.findByLabelText(/hours to confirm/i);
    await user.clear(hours);
    await user.type(hours, "100");
    await user.click(screen.getByRole("button", { name: /save rules/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/between 1 and 72/);
    expect(saveSettings.mock.calls[0][0]).toEqual(expect.objectContaining({ delivery_confirm_hours: 100, charge_return_on_decline: true }));
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ShipmentWizard from "./ShipmentWizard";

const paystackSpy = vi.fn();
vi.mock("react-paystack", () => ({
  usePaystackPayment: () => (options) => {
    paystackSpy(options.config);
    options.onSuccess({ reference: options.config.reference });
  },
}));
vi.mock("./components/Navbar", () => ({ default: () => <nav>navbar</nav> }));
vi.mock("../api/payments.api", () => ({ initializePayment: vi.fn() }));
vi.mock("../api/shipments.api", () => ({
  getDispatchZones: vi.fn(),
  createShipment: vi.fn(),
}));
import { initializePayment } from "../api/payments.api";
import { getDispatchZones, createShipment } from "../api/shipments.api";

const ZONES = {
  office: "Wuse, Abuja",
  zones: [
    { id: "garki", name: "Garki (Areas 1–11)", group: "City centre", distanceKm: 5, fee: 2000 },
    { id: "lugbe", name: "Lugbe", group: "Satellite towns", distanceKm: 18, fee: 4000 },
    { id: "kubwa", name: "Kubwa", group: "Satellite towns", distanceKm: 22, fee: 4500 },
  ],
};

const renderWizard = () =>
  render(
    <MemoryRouter>
      <ShipmentWizard />
    </MemoryRouter>,
  );

async function fillStepOne(user, zone = "kubwa") {
  await user.type(screen.getByPlaceholderText(/\+234/), "08000000000");
  await user.click(screen.getByText("Choose a device"));
  await user.click(screen.getByText("Laptop"));
  await user.type(screen.getByPlaceholderText(/iPhone 17 Pro/), "HP Elitebook");
  await user.type(screen.getByPlaceholderText(/Cracked screen/), "Won't charge");
  await user.type(screen.getByPlaceholderText(/Aminu Kano/), "12 Kubwa Road");
  await user.selectOptions(await screen.findByLabelText(/pickup area/i), zone);
}

describe("Shipment wizard — Abuja zone pricing", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-02T09:00:00Z")); // 10:00 AM Abuja
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 3, first_name: "Ada", last_name: "L", email: "ada@example.com", role: "user" }),
    );
    getDispatchZones.mockResolvedValue(ZONES);
    initializePayment.mockReset();
    createShipment.mockReset();
    paystackSpy.mockReset();
  });

  afterEach(() => vi.useRealTimers());

  it("lists Abuja areas with their fees from the server", async () => {
    renderWizard();
    expect(await screen.findByRole("option", { name: "Garki (Areas 1–11) — ₦2,000" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Lugbe — ₦4,000" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Kubwa — ₦4,500" })).toBeInTheDocument();
  });

  it("shows the selected area's fee", async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.selectOptions(await screen.findByLabelText(/pickup area/i), "lugbe");
    expect(screen.getByText(/from Lugbe to our Wuse workshop: ₦4,000/)).toBeInTheDocument();
  });

  it("offers only pickup windows at least 2 hours away today", async () => {
    const user = userEvent.setup();
    renderWizard();
    await fillStepOne(user);
    await user.click(screen.getByRole("button", { name: /next: schedule pickup/i }));

    const dateInput = document.querySelector('input[type="date"]');
    expect(dateInput.min).toBe("2026-11-02");
    await user.type(dateInput, "2026-11-02");

    const timeSelect = screen.getByRole("combobox");
    const options = Array.from(timeSelect.querySelectorAll("option")).map((o) => o.textContent);
    expect(options).not.toContain("11:30 AM – 12:30 PM");
    expect(options).toContain("12:00 PM – 1:00 PM");
    expect(options.at(-1)).toBe("9:00 PM – 10:00 PM");
  });

  it("charges the zone fee the server returns and creates the pickup", async () => {
    initializePayment.mockResolvedValueOnce({
      reference: "FXS_1",
      amount: 4500,
      amount_kobo: 450000,
      currency: "NGN",
      email: "ada@example.com",
    });
    createShipment.mockResolvedValueOnce({ reference: "FXR-1003", fee_amount: 4500 });

    const user = userEvent.setup();
    renderWizard();
    await fillStepOne(user, "kubwa");
    await user.click(screen.getByRole("button", { name: /next: schedule pickup/i }));
    await user.type(document.querySelector('input[type="date"]'), "2026-11-03");
    await user.selectOptions(screen.getByRole("combobox"), "09:00");
    await user.click(screen.getByRole("button", { name: /review summary/i }));

    expect(screen.getByText("₦4,500")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /proceed to payment/i }));
    await user.click(screen.getByRole("button", { name: /pay ₦4,500 with paystack/i }));

    expect(initializePayment).toHaveBeenCalledWith({
      purpose: "shipment",
      zone: "kubwa",
      pickup_date: "2026-11-03",
      pickup_time: "09:00",
    });
    expect(paystackSpy).toHaveBeenCalledWith(
      expect.objectContaining({ reference: "FXS_1", amount: 450000, currency: "NGN" }),
    );
    expect(createShipment).toHaveBeenCalledWith(
      expect.objectContaining({ zone: "kubwa", payment_reference: "FXS_1", pickup_time: "09:00" }),
    );
    expect(await screen.findByText("FXR-1003")).toBeInTheDocument();
  });

  it("asks guests to log in before paying", async () => {
    localStorage.removeItem("user");
    const user = userEvent.setup();
    renderWizard();
    await user.type(screen.getByPlaceholderText(/John Doe/), "Guest");
    await user.type(screen.getByPlaceholderText(/john@email.com/), "guest@example.com");
    await fillStepOne(user, "garki");
    await user.click(screen.getByRole("button", { name: /next: schedule pickup/i }));
    await user.type(document.querySelector('input[type="date"]'), "2026-11-03");
    await user.selectOptions(screen.getByRole("combobox"), "09:00");
    await user.click(screen.getByRole("button", { name: /review summary/i }));
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /proceed to payment/i }));

    expect(screen.getByRole("link", { name: /log in to pay ₦2,000/i })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: /with paystack/i })).not.toBeInTheDocument();
  });

  it("shows a retry when areas fail to load", async () => {
    getDispatchZones.mockRejectedValueOnce(new Error("Can't reach the server."));
    renderWizard();
    expect(await screen.findByRole("alert")).toHaveTextContent(/Can't reach the server/);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});

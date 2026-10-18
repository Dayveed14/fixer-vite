import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UserShipments from "./UserShipments";

const paystackSpy = vi.fn();
vi.mock("react-paystack", () => ({
  usePaystackPayment: () => (options) => {
    paystackSpy(options.config);
    options.onSuccess({ reference: options.config.reference });
  },
}));
vi.mock("../api/payments.api", () => ({ initializePayment: vi.fn() }));
vi.mock("../api/shipments.api", () => ({
  listUserShipments: vi.fn(),
  respondToQuote: vi.fn(),
  confirmDelivery: vi.fn(),
}));
import { initializePayment } from "../api/payments.api";
import { listUserShipments, respondToQuote, confirmDelivery } from "../api/shipments.api";

const base = {
  id: 3,
  reference: "FXR-1003",
  brand: "HP",
  device: "Laptop",
  fault: "Won't charge",
  address: "12 Kubwa Road",
  city: "Kubwa, Abuja",
  fee_amount: "4500.00",
  created_at: "2026-10-15T10:00:00Z",
  events: [],
};

const quoted = {
  ...base,
  status: "waiting_approval",
  approval_status: "pending",
  diagnosis_summary: "Charging IC is damaged.",
  repair_cost: "25000.00",
  return_fee: "4500.00",
  quote_total: "29500.00",
  decline_fee: 4500,
};

const renderPage = (path = "/usershipments") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <UserShipments />
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ id: 3, email: "ada@example.com", role: "user" }));
  [listUserShipments, respondToQuote, confirmDelivery, initializePayment, paystackSpy].forEach((m) => m.mockReset());
});

describe("customer shipments", () => {
  it("shows the timeline with a dot per step", async () => {
    listUserShipments.mockResolvedValueOnce([{ ...base, status: "device_collected" }]);
    renderPage();
    const history = await screen.findByRole("list", { name: /shipment history/i });
    expect(history.querySelectorAll("li")).toHaveLength(9);
    const current = history.querySelector('[aria-current="step"]');
    expect(current).toHaveTextContent("Device collected");
  });

  it("shows the quote and pays repair + return delivery on approval", async () => {
    listUserShipments.mockResolvedValue([quoted]);
    initializePayment.mockResolvedValueOnce({ reference: "FXR_1", amount_kobo: 2950000, currency: "NGN", email: "ada@example.com" });
    respondToQuote.mockResolvedValueOnce({ approval_status: "approved" });
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("Charging IC is damaged.")).toBeInTheDocument();
    expect(screen.getByText("₦29,500")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /approve and pay ₦29,500/i }));

    expect(initializePayment).toHaveBeenCalledWith({ purpose: "repair", shipment_id: 3 });
    expect(paystackSpy).toHaveBeenCalledWith(expect.objectContaining({ amount: 2950000, reference: "FXR_1" }));
    expect(respondToQuote).toHaveBeenCalledWith(3, { decision: "approve", payment_reference: "FXR_1" });
    expect(listUserShipments).toHaveBeenCalledTimes(2); // refreshed
  });

  it("declining asks to confirm and pays only the return fee", async () => {
    listUserShipments.mockResolvedValue([quoted]);
    initializePayment.mockResolvedValueOnce({ reference: "FXT_1", amount_kobo: 450000, currency: "NGN", email: "ada@example.com" });
    respondToQuote.mockResolvedValueOnce({ approval_status: "declined" });
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole("button", { name: /^decline$/i }));
    expect(screen.getByText(/only pay return delivery: ₦4,500/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /pay ₦4,500 and decline/i }));

    expect(initializePayment).toHaveBeenCalledWith({ purpose: "return", shipment_id: 3 });
    expect(respondToQuote).toHaveBeenCalledWith(3, { decision: "decline", payment_reference: "FXT_1" });
  });

  it("declines without payment when no fee applies", async () => {
    listUserShipments.mockResolvedValue([{ ...quoted, decline_fee: 0 }]);
    respondToQuote.mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: /^decline$/i }));
    await user.click(screen.getByRole("button", { name: /decline repair/i }));
    expect(initializePayment).not.toHaveBeenCalled();
    expect(respondToQuote).toHaveBeenCalledWith(3, { decision: "decline", payment_reference: undefined });
  });

  it("offers a retry that reuses the payment if confirmation fails", async () => {
    listUserShipments.mockResolvedValue([quoted]);
    initializePayment.mockResolvedValueOnce({ reference: "FXR_9", amount_kobo: 2950000, currency: "NGN", email: "a@b.c" });
    respondToQuote.mockRejectedValueOnce(new Error("Paystack is slow.")).mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: /approve and pay/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("FXR_9");
    await user.click(screen.getByRole("button", { name: /retry confirmation/i }));
    expect(respondToQuote).toHaveBeenLastCalledWith(3, { decision: "approve", payment_reference: "FXR_9" });
    expect(initializePayment).toHaveBeenCalledTimes(1);
  });

  it("asks the customer to confirm delivery, with the time left", async () => {
    const deadline = new Date(Date.now() + 5 * 3600e3 + 120e3).toISOString();
    listUserShipments.mockResolvedValue([{ ...base, status: "ready_for_delivery", delivery_confirm_by: deadline }]);
    confirmDelivery.mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText(/5h \d+m/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /i've received my device/i }));
    expect(confirmDelivery).toHaveBeenCalledWith(3);
  });

  it("opens the shipment a notification linked to", async () => {
    listUserShipments.mockResolvedValue([
      { ...base, id: 1, reference: "FXR-1001", status: "repair" },
      { ...base, id: 3, status: "diagnosis" },
    ]);
    renderPage("/usershipments?open=3");
    const cards = await screen.findAllByRole("button", { expanded: true });
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("FXR-1003");
  });
});

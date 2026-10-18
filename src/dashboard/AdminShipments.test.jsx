import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminShipments from "./AdminShipments";

vi.mock("../api/shipments.api", () => ({
  listShipments: vi.fn(),
  getShipment: vi.fn(),
  sendQuote: vi.fn(),
  updateShipmentStatus: vi.fn(),
}));
import { listShipments, getShipment, sendQuote, updateShipmentStatus } from "../api/shipments.api";

const row = (o) => ({
  id: 3,
  reference: "FXR-1003",
  name: "Ada",
  email: "ada@example.com",
  device: "Laptop",
  brand: "HP",
  fee_amount: "4500",
  status: "device_collected",
  next_actions: { statuses: ["diagnosis"], can_quote: false, awaiting_customer: false },
  ...o,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminShipments />
    </MemoryRouter>,
  );

beforeEach(() => {
  [listShipments, getShipment, sendQuote, updateShipmentStatus].forEach((m) => m.mockReset());
  getShipment.mockResolvedValue({ events: [] });
});

describe("admin shipments", () => {
  it("only offers the next allowed step", async () => {
    listShipments.mockResolvedValue([row()]);
    updateShipmentStatus.mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderPage();
    const next = await screen.findByRole("button", { name: "Start diagnosis" });
    expect(screen.queryByRole("button", { name: "Start repair" })).not.toBeInTheDocument();
    await user.click(next);
    expect(updateShipmentStatus).toHaveBeenCalledWith(3, "diagnosis");
    expect(listShipments).toHaveBeenCalledTimes(2);
  });

  it("sends the diagnosis and repair cost from the quote form", async () => {
    listShipments.mockResolvedValue([row({ status: "diagnosis", next_actions: { statuses: [], can_quote: true } })]);
    sendQuote.mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole("button", { name: /send diagnosis & quote/i }));
    const send = screen.getByRole("button", { name: /send quote to customer/i });
    expect(send).toBeDisabled();
    await user.type(screen.getByLabelText(/what's wrong/i), "Faulty charging IC");
    await user.type(screen.getByLabelText(/repair cost/i), "25000");
    await user.click(send);

    expect(sendQuote).toHaveBeenCalledWith(3, { diagnosis: "Faulty charging IC", repair_cost: 25000 });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows when it's waiting on the customer", async () => {
    listShipments.mockResolvedValue([
      row({ status: "waiting_approval", approval_status: "pending", next_actions: { statuses: [], can_quote: true, awaiting_customer: true } }),
    ]);
    renderPage();
    expect(await screen.findByText(/waiting for the customer/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /revise quote/i })).toBeInTheDocument();
  });

  it("shows the server's reason when a step is refused", async () => {
    listShipments.mockResolvedValue([row()]);
    updateShipmentStatus.mockRejectedValueOnce(new Error("Waiting for the customer to approve or decline the quote."));
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Start diagnosis" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/FXR-1003: Waiting for the customer/);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppointmentActions from "./AppointmentActions";
import RepairActions from "./RepairActions";
import TicketActions from "./TicketActions";

vi.mock("../../api/technician.api", () => ({
  startRemoteSession: vi.fn(),
  createMeetingLink: vi.fn(),
  setAppointmentStatus: vi.fn(),
  reportRepair: vi.fn(),
  setTicketStatus: vi.fn(),
}));
import * as techApi from "../../api/technician.api";

const booking = (o) => ({ id: 20, status: "confirmed", customer_phone: "08031234567", ...o });

beforeEach(() => {
  Object.values(techApi).forEach((fn) => fn.mockReset?.());
  window.open = vi.fn();
});

describe("starting an appointment", () => {
  it("remote support starts a MeshCentral session", async () => {
    techApi.startRemoteSession.mockResolvedValueOnce({ inviteLink: "x" });
    const user = userEvent.setup();
    render(<AppointmentActions booking={booking({ support_type: "remote_desktop" })} />);
    await user.click(screen.getByRole("button", { name: /start remote session/i }));
    expect(techApi.startRemoteSession).toHaveBeenCalledWith(20);
    expect(await screen.findByText(/invite sent/i)).toBeInTheDocument();
  });

  it("voice shows the customer's number with call and WhatsApp — no MeshCentral", async () => {
    const user = userEvent.setup();
    render(<AppointmentActions booking={booking({ support_type: "voice" })} />);
    expect(screen.queryByRole("button", { name: /remote session/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /call customer/i }));
    expect(screen.getByRole("link", { name: /call now/i })).toHaveAttribute("href", "tel:08031234567");
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute("href", "https://wa.me/2348031234567");
    expect(techApi.startRemoteSession).not.toHaveBeenCalled();
  });

  it("video opens the booking's meeting link", async () => {
    const user = userEvent.setup();
    render(<AppointmentActions booking={booking({ support_type: "video", meeting_url: "https://meet.google.com/abc-defg-hij" })} />);
    await user.click(screen.getByRole("button", { name: /join video call/i }));
    expect(window.open).toHaveBeenCalledWith("https://meet.google.com/abc-defg-hij", "_blank", "noopener,noreferrer");
    expect(techApi.startRemoteSession).not.toHaveBeenCalled();
  });

  it("video without a link creates one first", async () => {
    techApi.createMeetingLink.mockResolvedValueOnce({ meeting_url: "https://meet.jit.si/Fixer-BK1-abc" });
    const user = userEvent.setup();
    render(<AppointmentActions booking={booking({ support_type: "video" })} />);
    await user.click(screen.getByRole("button", { name: /create & join/i }));
    expect(window.open).toHaveBeenCalledWith("https://meet.jit.si/Fixer-BK1-abc", "_blank", "noopener,noreferrer");
  });

  it("marks completed without asking for an amount", async () => {
    techApi.setAppointmentStatus.mockResolvedValueOnce({});
    const onChanged = vi.fn();
    const user = userEvent.setup();
    render(<AppointmentActions booking={booking({ support_type: "voice" })} onChanged={onChanged} />);
    await user.click(screen.getByRole("button", { name: /mark completed/i }));
    expect(techApi.setAppointmentStatus).toHaveBeenCalledWith(20, "completed");
    expect(onChanged).toHaveBeenCalled();
    expect(screen.queryByLabelText(/amount/i)).not.toBeInTheDocument();
  });
});

describe("repairs", () => {
  it("marks repaired with no amount", async () => {
    techApi.reportRepair.mockResolvedValueOnce({});
    const user = userEvent.setup();
    render(<RepairActions repair={{ id: 3, status: "repair" }} />);
    await user.click(screen.getByRole("button", { name: /mark repaired/i }));
    expect(techApi.reportRepair).toHaveBeenCalledWith(3, { outcome: "repaired", note: undefined });
  });

  it("can't repair needs a reason", async () => {
    techApi.reportRepair.mockResolvedValueOnce({});
    const user = userEvent.setup();
    render(<RepairActions repair={{ id: 3, status: "repair" }} />);
    await user.click(screen.getByRole("button", { name: /can't repair/i }));
    const send = screen.getByRole("button", { name: /send to admin/i });
    expect(send).toBeDisabled();
    await user.type(screen.getByLabelText(/why can't/i), "Cracked board");
    await user.click(send);
    expect(techApi.reportRepair).toHaveBeenCalledWith(3, { outcome: "unrepairable", note: "Cracked board" });
  });

  it("shows it's with the admin once reported", () => {
    render(<RepairActions repair={{ id: 3, status: "repair", repair_outcome: "repaired" }} />);
    expect(screen.getByText(/waiting on the admin/i)).toBeInTheDocument();
  });
});

describe("other tickets", () => {
  it("completes without an amount", async () => {
    techApi.setTicketStatus.mockResolvedValueOnce({});
    const user = userEvent.setup();
    render(<TicketActions ticket={{ id: 31, ticket_code: "#TK31", status: "Open" }} />);
    await user.click(screen.getByRole("button", { name: /mark complete/i }));
    expect(techApi.setTicketStatus).toHaveBeenCalledWith(31, "Completed");
  });
});

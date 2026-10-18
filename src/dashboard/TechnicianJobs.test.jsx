import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TechnicianJobs from "./TechnicianJobs";

vi.mock("../api/technician.api", () => ({
  listMyAppointments: vi.fn(),
  listMyRepairs: vi.fn(),
  listMyTickets: vi.fn(),
  startRemoteSession: vi.fn(),
  createMeetingLink: vi.fn(),
  setAppointmentStatus: vi.fn(),
  reportRepair: vi.fn(),
  setTicketStatus: vi.fn(),
}));
import * as techApi from "../api/technician.api";

beforeEach(() => {
  techApi.listMyAppointments.mockResolvedValue([
    { id: 1, booking_reference: "#BK1", support_type: "voice", status: "confirmed", customer_name: "Ada", ticket_id: 30 },
  ]);
  techApi.listMyRepairs.mockResolvedValue([{ id: 3, reference: "FXR-1003", status: "repair", name: "Bola", device: "Laptop" }]);
  techApi.listMyTickets.mockResolvedValue([
    { id: 30, ticket_code: "#TK30", status: "Open" },
    { id: 31, ticket_code: "#TK31", status: "Open", customer_name: "Chi" },
  ]);
});

describe("Assigned jobs", () => {
  it("lists appointments, repairs and other tickets together", async () => {
    render(<TechnicianJobs />);
    expect(await screen.findByText("#BK1")).toBeInTheDocument();
    expect(screen.getByText(/FXR-1003/)).toBeInTheDocument();
    expect(screen.getByText(/#TK31/)).toBeInTheDocument();
    expect(screen.queryByText(/#TK30/)).not.toBeInTheDocument(); // the booking's own ticket
  });

  it("filters by job type", async () => {
    const user = userEvent.setup();
    render(<TechnicianJobs />);
    await screen.findByText("#BK1");
    await user.click(screen.getByRole("button", { name: /^repairs/i }));
    expect(screen.queryByText("#BK1")).not.toBeInTheDocument();
    expect(screen.getByText(/FXR-1003/)).toBeInTheDocument();
  });

  it("still shows the other lists if one fails", async () => {
    techApi.listMyRepairs.mockRejectedValueOnce(new Error("Not found."));
    render(<TechnicianJobs />);
    expect(await screen.findByText("#BK1")).toBeInTheDocument();
    expect(screen.getByText(/couldn't load repairs/i)).toBeInTheDocument();
  });
});

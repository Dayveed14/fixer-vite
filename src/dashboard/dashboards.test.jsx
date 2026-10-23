// Every dashboard card leads somewhere real.
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { vi } from "vitest";

const responses = vi.hoisted(() => ({}));
vi.mock("../api/client", () => ({
  default: {
    get: vi.fn(async (url) => {
      const key = Object.keys(responses).find((k) => url.startsWith(k));
      return { data: key ? responses[key] : [] };
    }),
    post: vi.fn(async () => ({ data: {} })),
  },
  getStoredUser: () => JSON.parse(localStorage.getItem("user") || "null"),
}));

import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import TechnicianDashboard from "./TechnicianDashboard";

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>;
}

function renderAt(element) {
  return render(
    <MemoryRouter initialEntries={["/start"]}>
      <Routes>
        <Route path="/start" element={element} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );
}

const hrefOf = (name) => screen.getByRole("link", { name }).getAttribute("href");

afterEach(() => {
  for (const k of Object.keys(responses)) delete responses[k];
});

describe("admin dashboard", () => {
  beforeEach(() => {
    localStorage.setItem("user", JSON.stringify({ id: 1, first_name: "Dave", role: "admin" }));
    Object.assign(responses, {
      "/api/stats/dashboard": { totalUsers: 12, totalTechnicians: 3, openTickets: 4, revenue: 50000, totalDevices: 7, repairsToday: 1, pendingApprovals: 2 },
      "/api/tickets": [{ id: 9, ticket_code: "#TK1009", customer_name: "Ada", issue: "Screen", status: "Open" }],
      "/api/users/technicians": [{ id: 5, first_name: "Tee", last_name: "Ech" }],
    });
  });

  it("stat cards, health items, technicians and revenue are links", async () => {
    renderAt(<AdminDashboard />);
    await screen.findByText("Total Users");
    expect(hrefOf(/12\s*Total Users/)).toBe("/admin/users");
    expect(hrefOf(/3\s*Technicians/)).toBe("/admin/technicians");
    expect(hrefOf(/4\s*Open Tickets/)).toBe("/admintickets");
    expect(hrefOf(/₦50,000\s*Revenue/)).toBe("/admin/payments");
    expect(hrefOf(/Repairs Delivered Today/)).toBe("/adminshipments");
    expect(hrefOf(/Needs Attention/)).toBe("/admin/bookings");
    expect(hrefOf(/Tee Ech/)).toBe("/admin/technicians/edit/5");
    expect(hrefOf(/Monthly Revenue/)).toBe("/admin/payments");
  });

  it("ticket rows and every quick action go somewhere", async () => {
    renderAt(<AdminDashboard />);
    fireEvent.click(await screen.findByText("#TK1009"));
    expect(screen.getByTestId("where")).toHaveTextContent("/admin/tickets/9");
  });

  it.each([
    ["Pending Bookings", "/admin/bookings"],
    ["Payments & Alerts", "/admin/payments"],
    ["Mail-In Repairs", "/adminshipments"],
    ["Pricing", "/adminpricing"],
  ])("quick action %s → %s", async (label, path) => {
    renderAt(<AdminDashboard />);
    fireEvent.click(await screen.findByRole("button", { name: label }));
    expect(screen.getByTestId("where")).toHaveTextContent(path);
  });
});

describe("customer dashboard", () => {
  beforeEach(() => {
    localStorage.setItem("user", JSON.stringify({ id: 3, first_name: "Ada", role: "user" }));
    Object.assign(responses, {
      "/api/stats/user": { appointmentsCount: 2, repairsInProgress: 1, registeredDevices: 1, aiDiagnoses: 4 },
      "/api/tickets": [{ id: 21, ticket_code: "#TK1021", issue: "Fan", status: "Completed", technician_id: 5 }],
      "/api/bookings": [{ id: 44, support_type: "video", booking_date: "2026-10-30", booking_time: "14:30:00", meeting_url: "https://meet.jit.si/x" }],
      "/api/devices": [{ id: 1, device_name: "HP Laptop", last_serviced_at: "2026-09-01T10:00:00Z" }],
      "/api/notifications": { notifications: [{ id: 7, title: "Pickup scheduled", message: "x", created_at: "2026-10-20T10:00:00Z", reference_type: "shipment", reference_id: 12 }] },
    });
  });

  it("stats, appointment and activity open the right pages", async () => {
    renderAt(<UserDashboard />);
    await screen.findByText(/Welcome Back/);
    expect(hrefOf(/2\s*Appointments/)).toBe("/user/appointments");
    expect(hrefOf(/1\s*Repairs in Progress/)).toBe("/usershipments");
    expect(hrefOf(/AI Diagnoses/)).toBe("/diagnosis");
    expect(hrefOf(/Video Call/)).toBe("/userappointment/44");
    expect(screen.getByText("2:30pm")).toBeInTheDocument();
    expect(hrefOf(/Pickup scheduled/)).toBe("/usershipments?open=12");
  });

  it("no more dead Live Chat button; actions navigate", async () => {
    renderAt(<UserDashboard />);
    await screen.findByText(/Welcome Back/);
    expect(screen.queryByText(/Live Chat/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Send Device for Repair/ }));
    expect(screen.getByTestId("where")).toHaveTextContent("/shipment");
  });

  it("a ticket row opens the job, but rating stars don't navigate", async () => {
    renderAt(<UserDashboard />);
    fireEvent.click(await screen.findByText("#TK1021"));
    expect(screen.getByTestId("where")).toHaveTextContent("/userjob/21");
  });
});

describe("technician dashboard", () => {
  beforeEach(() => {
    localStorage.setItem("user", JSON.stringify({ id: 5, first_name: "Tee", role: "technician" }));
    Object.assign(responses, {
      "/api/stats/technician": { assignedJobs: 3, completedToday: 1, pendingRepairs: 2, devicesRepaired: 9, performancePercent: 96 },
      "/api/tickets/active": { id: 1, customer_name: "Ada", issue: "Fan", customer_phone: "0803 123 4567" },
      "/api/tickets": [{ id: 2, ticket_code: "#TK1002", customer_name: "Ada", priority: "High", status: "In Progress" }],
      "/api/bookings": [{ id: 4, support_type: "voice", booking_time: "10:00:00", customer_name: "Bola" }],
    });
  });

  it("stats, schedule and customer contact are actionable", async () => {
    renderAt(<TechnicianDashboard />);
    await screen.findByText(/Welcome Back/);
    expect(hrefOf(/3\s*Assigned Jobs/)).toBe("/technician/jobs");
    expect(hrefOf(/2\s*Pending Repairs/)).toBe("/technician/repairs");
    expect(hrefOf(/10:00 · Bola/)).toBe("/technician/appointments");
    expect(hrefOf("Call")).toBe("tel:08031234567");
    expect(hrefOf("WhatsApp")).toBe("https://wa.me/2348031234567");
  });

  it("the old disabled placeholder is now a working action", async () => {
    renderAt(<TechnicianDashboard />);
    fireEvent.click(await screen.findByRole("button", { name: "Report a Repair Result" }));
    expect(screen.getByTestId("where")).toHaveTextContent("/technician/repairs");
  });
});

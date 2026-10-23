import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";

const calls = vi.hoisted(() => ({ get: [], patch: [] }));
vi.mock("../api/client", () => ({
  default: {
    get: vi.fn(async (url, opts) => {
      calls.get.push([url, opts]);
      if (url === "/api/health/metrics")
        return { data: { server_errors_last_5_min: 0, alerts_sent: 1, alert_channels: { email: true }, payments: { unfulfilled: 2, failed_last_hour: 0 }, recent_alerts: [] } };
      if (url.endsWith("/events")) return { data: [{ id: 1, event: "status_changed", from_status: "pending", to_status: "success", source: "webhook", created_at: "2026-10-20T10:00:00Z" }] };
      if (url === "/api/payments") return { data: [{ reference: "FXB_1", purpose: "booking", email: "a@b.c", amount_kobo: 500000, status: "success", created_at: "2026-10-20T10:00:00Z", entity_type: null }] };
      if (url.startsWith("/api/users/")) return { data: { id: 5, first_name: "Tee", last_name: "Ech", email: "t@x.c", phone: "", role: "technician" } };
      return { data: [] };
    }),
    patch: vi.fn(async (url, body) => {
      calls.patch.push([url, body]);
      return { data: {} };
    }),
  },
  getStoredUser: () => null,
}));

import AdminPayments from "./AdminPayments";
import EditUser from "./EditUser";

it("payments page shows health, filters by 'paid, not used' and opens a payment's history", async () => {
  render(<MemoryRouter><AdminPayments /></MemoryRouter>);
  expect(await screen.findByText("paid but unused for 15+ min")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: "Paid, not used" }));
  await waitFor(() =>
    expect(calls.get.some(([u, o]) => u === "/api/payments" && o?.params?.unfulfilled === "true")).toBe(true),
  );
  fireEvent.click(await screen.findByText("FXB_1"));
  expect(await screen.findByText(/pending → success via webhook/)).toBeInTheDocument();
});

it("edit user saves name, phone and role, then returns to the list", async () => {
  render(
    <MemoryRouter initialEntries={["/admin/technicians/edit/5"]}>
      <Routes>
        <Route path="/admin/technicians/edit/:id" element={<EditUser />} />
        <Route path="/admin/technicians" element={<p>Technicians list</p>} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.change(await screen.findByLabelText("First name"), { target: { value: "Tobi" } });
  fireEvent.change(screen.getByLabelText("Role"), { target: { value: "user" } });
  expect(screen.getByText(/signed out/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(await screen.findByText("Technicians list")).toBeInTheDocument();
  expect(calls.patch[0]).toEqual(["/api/users/5", { first_name: "Tobi", last_name: "Ech", phone: "", role: "user" }]);
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import BookCall from "./BookCall";

vi.mock("react-paystack", () => ({
  usePaystackPayment: () => (options) => options.onSuccess({ reference: options.config.reference }),
}));
vi.mock("../api/payments.api", () => ({ initializePayment: vi.fn() }));
vi.mock("../api/bookings.api", () => ({
  createBooking: vi.fn(),
  getSupportTypes: vi.fn().mockResolvedValue([
    { id: "voice", title: "Voice Call", amount: 5000 },
    { id: "video", title: "Video Call", amount: 7000 },
    { id: "remote", title: "Remote Support", amount: 10000 },
  ]),
}));
import { initializePayment } from "../api/payments.api";
import { createBooking } from "../api/bookings.api";

// 9:00 PM in Abuja on Mon 2 Nov 2026 (UTC+1).
const NINE_PM_ABUJA = new Date("2026-11-02T20:00:00Z");

function renderBookCall() {
  return render(
    <MemoryRouter>
      <BookCall />
    </MemoryRouter>,
  );
}

const dayButton = (day) =>
  screen.getAllByRole("button", { name: String(day) }).find((b) => b.className.includes("bookcall__cal-day"));

describe("BookCall time rules", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NINE_PM_ABUJA);
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 3, first_name: "Ada", last_name: "L", email: "ada@example.com", role: "user" }),
    );
    initializePayment.mockReset();
    createBooking.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("at 9 PM, today can't be picked and earlier days are disabled", () => {
    renderBookCall();
    expect(dayButton(2)).toBeDisabled(); // today — nothing left
    expect(dayButton(1)).toBeDisabled(); // yesterday
    expect(dayButton(3)).not.toBeDisabled(); // tomorrow
  });

  it("tomorrow offers 8:00 AM to 9:30 PM only", async () => {
    const user = userEvent.setup();
    renderBookCall();
    await user.click(dayButton(3));

    expect(screen.getByRole("button", { name: "8:00 AM" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "9:30 PM" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "10:00 PM" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "7:30 AM" })).not.toBeInTheDocument();
  });

  it("only offers later times earlier in the day", async () => {
    vi.setSystemTime(new Date("2026-11-02T13:10:00Z")); // 2:10 PM Abuja
    const user = userEvent.setup();
    renderBookCall();
    await user.click(dayButton(2));
    expect(screen.queryByRole("button", { name: "3:00 PM" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3:30 PM" })).toBeInTheDocument();
  });

  it("initialises the payment on the server, pays with that reference, then confirms the booking", async () => {
    initializePayment.mockResolvedValueOnce({
      reference: "FXB_abc",
      amount: 7000,
      amount_kobo: 700000,
      currency: "NGN",
      email: "ada@example.com",
    });
    createBooking.mockResolvedValueOnce({ booking_reference: "#BK1055", id: 55 });

    const user = userEvent.setup();
    renderBookCall();

    await user.click(dayButton(3));
    await user.click(screen.getByRole("button", { name: "10:00 AM" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    // Name/email prefilled from the session
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByText("Video Call"));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.click(screen.getByRole("button", { name: /pay ₦7,000 with paystack/i }));

    expect(initializePayment).toHaveBeenCalledWith({
      purpose: "booking",
      support_type: "video",
      booking_date: "2026-11-03",
      booking_time: "10:00",
    });
    expect(createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        support_type: "video",
        booking_date: "2026-11-03",
        booking_time: "10:00",
        payment_reference: "FXB_abc",
      }),
    );
    expect(await screen.findByText("#BK1055")).toBeInTheDocument();
  });

  it("offers a safe retry if confirmation fails after payment", async () => {
    initializePayment.mockResolvedValueOnce({
      reference: "FXB_retry",
      amount: 5000,
      amount_kobo: 500000,
      currency: "NGN",
      email: "ada@example.com",
    });
    createBooking
      .mockRejectedValueOnce(new Error("We couldn't confirm your payment with Paystack just now."))
      .mockResolvedValueOnce({ booking_reference: "#BK1056" });

    const user = userEvent.setup();
    renderBookCall();
    await user.click(dayButton(3));
    await user.click(screen.getByRole("button", { name: "9:00 AM" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByText("Voice Call"));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByRole("button", { name: /pay ₦5,000/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("FXB_retry");
    // Can't go back and change the slot after paying
    expect(screen.getByRole("button", { name: /^back$/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /retry confirmation/i }));
    expect(createBooking).toHaveBeenCalledTimes(2);
    expect(createBooking.mock.calls[1][0].payment_reference).toBe("FXB_retry");
    expect(await screen.findByText("#BK1056")).toBeInTheDocument();
  });

  it("shows the server's reason if initialisation is refused (e.g. slot just expired)", async () => {
    initializePayment.mockRejectedValueOnce(new Error("That time is no longer available today."));
    const user = userEvent.setup();
    renderBookCall();
    await user.click(dayButton(3));
    await user.click(screen.getByRole("button", { name: "9:00 AM" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByText("Voice Call"));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByRole("button", { name: /pay ₦5,000/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no longer available/);
    expect(createBooking).not.toHaveBeenCalled();
  });
});

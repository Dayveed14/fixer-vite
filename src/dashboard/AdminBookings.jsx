import { useEffect, useState } from "react";
import api from "../api/client";
import { FaCalendarAlt, FaUserTie } from "react-icons/fa";
import "./AdminBookings.css";
import BookingsDataTable from "../components/BookingsDataTable";

const SUPPORT_TYPE_LABELS = {
  voice: "Voice Call",
  video: "Video Call",
  remote_desktop: "Remote Support",
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechByBooking, setSelectedTechByBooking] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allBookings, setAllBookings] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [bookingsRes, techniciansRes, allRes] = await Promise.all([
        api.get(`/api/bookings`, {
          params: { status: "pending" },
        }),
        api.get(`/api/users/technicians`),
        api.get(`/api/bookings`),
      ]);

      setBookings(bookingsRes.data);
      setTechnicians(techniciansRes.data);
      setAllBookings(allRes.data); // Set all bookings for the table
    } catch (err) {
      console.error(err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTechSelect = (bookingId, technicianId) => {
    setSelectedTechByBooking((prev) => ({
      ...prev,
      [bookingId]: technicianId,
    }));
  };

  const handleAssign = async (bookingId) => {
    const technicianId = selectedTechByBooking[bookingId];

    if (!technicianId) return;

    setAssigningId(bookingId);

    try {
     await api.patch(`/api/bookings/${bookingId}/assign`, {
  technician_id: technicianId,
});

await fetchData();

      // Assigned bookings leave the "pending" list, so just drop it locally.
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (err) {
      console.error(err);
      setError("Failed to assign technician. Please try again.");
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-bookings">
        <p className="dashboard-loading">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="admin-bookings">
      <section className="admin-bookings-header">
        <div>
          <h1>Pending Bookings</h1>
          <p>
            Assign a technician to confirm each booking and create its repair
            ticket.
          </p>
        </div>
      </section>

      {error && <p className="admin-bookings-error">{error}</p>}

      {bookings.length === 0 ? (
        <p className="dashboard-empty">No pending bookings right now.</p>
      ) : (
        <div className="admin-bookings-list">
          {bookings.map((booking) => (
            <div className="admin-booking-card" key={booking.id}>
              <div className="admin-booking-info">
                <FaCalendarAlt className="admin-booking-icon" />

                <div>
                  <h3>{booking.customer_name}</h3>

                  <p>
                    {SUPPORT_TYPE_LABELS[booking.support_type] ||
                      booking.support_type}
                    {" • "}
                    {booking.booking_date} at {booking.booking_time}
                  </p>

                  {booking.device && (
                    <p className="admin-booking-device">
                      Device: {booking.device}
                    </p>
                  )}

                  {booking.issue_summary && (
                    <p className="admin-booking-issue">
                      "{booking.issue_summary}"
                    </p>
                  )}

                  <span className="admin-booking-ref">
                    {booking.booking_reference}
                  </span>
                </div>
              </div>

              <div className="admin-booking-actions">
                <div className="admin-booking-select-wrap">
                  <FaUserTie />
                  <select
                    value={selectedTechByBooking[booking.id] || ""}
                    onChange={(e) =>
                      handleTechSelect(booking.id, e.target.value)
                    }>
                    <option value="" disabled>
                      Select technician
                    </option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.first_name} {tech.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="admin-booking-assign-btn"
                  onClick={() => handleAssign(booking.id)}
                  disabled={
                    !selectedTechByBooking[booking.id] ||
                    assigningId === booking.id
                  }>
                  {assigningId === booking.id ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="admin-bookings-divider" /> 
      <section className="admin-bookings-table-section"> 
        <div className="admin-bookings-table-header"> 
          <h2>All Bookings</h2> 
          <p>Search, filter, sort, and manage your booking records.</p> 
          </div> 
          <BookingsDataTable bookings={allBookings} /> 
      </section> 
      </div> 
      ); 
    };

export default AdminBookings;

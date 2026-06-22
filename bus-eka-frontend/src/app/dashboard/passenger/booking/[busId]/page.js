"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import socket from "@/lib/socket";
import { useParams, useRouter } from "next/navigation";

export default function BookingPage() {
  const { busId } = useParams();
  const router = useRouter();

  const [bus, setBus] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= LOAD BUS + TRIPS + SEATS =================
  const fetchBookingData = async () => {
    try {
      const [busRes, tripsRes, seatsRes] = await Promise.all([
        api.get(`/buses/${busId}`),
        api.get(`/trips/bus/${busId}`),
        api.get(`/seats/bus/${busId}`)
      ]);

      setBus(busRes.data.data || null);
      setTrips(tripsRes.data.data || []);
      setSeats(seatsRes.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load booking details");
    }
  };

  useEffect(() => {
    if (busId) {
      fetchBookingData();
    }
  }, [busId]);

  // ================= SOCKET LISTENERS =================
  useEffect(() => {
    socket.on("seatLocked", (data) => {
      setSeats((prev) =>
        prev.map((seat) =>
          seat.id === data.seatId
            ? { ...seat, status: "LOCKED" }
            : seat
        )
      );
    });

    socket.on("seatUnlocked", (data) => {
      setSeats((prev) =>
        prev.map((seat) =>
          seat.id === data.seatId
            ? { ...seat, status: "AVAILABLE" }
            : seat
        )
      );
    });

    return () => {
      socket.off("seatLocked");
      socket.off("seatUnlocked");
    };
  }, []);

  // ================= SELECT / UNSELECT SEAT =================
  const toggleSeat = async (seat) => {
    if (!selectedTrip) {
      alert("Please select a trip schedule first");
      return;
    }

    if (seat.status === "BOOKED") return;

    const alreadySelected = selectedSeats.includes(seat.id);

    if (alreadySelected) {
      setSelectedSeats((prev) => prev.filter((id) => id !== seat.id));

      setSeats((prev) =>
        prev.map((s) =>
          s.id === seat.id ? { ...s, status: "AVAILABLE" } : s
        )
      );

      return;
    }

    if (seat.status !== "AVAILABLE") {
      alert("This seat is not available");
      return;
    }

    try {
      await api.post("/seats/lock", {
        seatId: seat.id
      });

      setSelectedSeats((prev) => [...prev, seat.id]);

      setSeats((prev) =>
        prev.map((s) =>
          s.id === seat.id ? { ...s, status: "LOCKED" } : s
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to lock seat");
    }
  };

  // ================= CREATE BOOKING =================
  const createBooking = async () => {
    if (!selectedTrip) {
      alert("Please select a trip schedule");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/bookings", {
        tripId: Number(selectedTrip.id),
        seatIds: selectedSeats
      });

      const bookingId = res.data?.data?.id || res.data?.id;

      if (!bookingId) {
        alert("Booking created, but booking ID not returned");
        return;
      }

      alert("Booking created successfully");
      router.push(`/dashboard/passenger/booking/success/${bookingId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedSeatNumbers = seats
    .filter((seat) => selectedSeats.includes(seat.id))
    .map((seat) => seat.seatNumber);

  const totalAmount = selectedTrip
    ? Number(selectedTrip.price || 0) * selectedSeats.length
    : 0;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Seat Booking</h2>

      {/* BUS DETAILS */}
      {bus && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-2">Bus: {bus.licensePlate}</h5>

            <p className="mb-1">
              <strong>Category:</strong> {bus.category || "N/A"}
            </p>

            <p className="mb-1">
              <strong>Type:</strong> {bus.busType || "N/A"}
            </p>

            {bus.route && (
              <p className="mb-0">
                <strong>Route:</strong> {bus.route.startLocation} → {bus.route.endLocation}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TRIP SCHEDULES */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">Available Trip Schedules</h5>

          {trips.length === 0 ? (
            <div className="alert alert-warning mb-0">
              No trips available for this bus
            </div>
          ) : (
            <div className="row">
              {trips.map((trip) => (
                <div key={trip.id} className="col-md-6 mb-3">
                  <div
                    className={`card h-100 ${
                      selectedTrip?.id === trip.id ? "border-primary" : ""
                    }`}
                  >
                    <div className="card-body">
                      <h6 className="mb-2">
                        {trip.departureCity} → {trip.arrivalCity}
                      </h6>

                      <p className="mb-1">
                        <strong>Date:</strong>{" "}
                        {trip.tripDate
                          ? new Date(trip.tripDate).toLocaleDateString()
                          : "N/A"}
                      </p>

                      <p className="mb-1">
                        <strong>Departure:</strong> {trip.departureTime}
                      </p>

                      <p className="mb-1">
                        <strong>Arrival:</strong> {trip.arrivalTime}
                      </p>

                      <p className="mb-3">
                        <strong>Price:</strong> Rs. {trip.price}
                      </p>

                      <button
                        className={`btn w-100 ${
                          selectedTrip?.id === trip.id
                            ? "btn-success"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => {
                          setSelectedTrip(trip);
                          setSelectedSeats([]);
                        }}
                      >
                        {selectedTrip?.id === trip.id ? "Selected" : "Select Trip"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SEATS */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">Select Seats</h5>

          {!selectedTrip ? (
            <div className="alert alert-info mb-0">
              Please select a trip first
            </div>
          ) : (
            <div className="row">
              {seats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.id);

                return (
                  <div
                    key={seat.id}
                    className="col-md-2 col-sm-3 col-4 mb-3"
                  >
                    <button
                      className={`btn w-100 ${
                        seat.status === "BOOKED"
                          ? "btn-danger"
                          : isSelected
                          ? "btn-info"
                          : seat.status === "LOCKED"
                          ? "btn-warning"
                          : "btn-success"
                      }`}
                      disabled={seat.status === "BOOKED"}
                      onClick={() => toggleSeat(seat)}
                    >
                      {seat.seatNumber}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Booking Summary</h5>

          <p className="mb-2">
            <strong>Selected Trip:</strong>{" "}
            {selectedTrip
              ? `${selectedTrip.departureCity} → ${selectedTrip.arrivalCity}`
              : "No trip selected"}
          </p>

          <p className="mb-2">
            <strong>Trip Date:</strong>{" "}
            {selectedTrip?.tripDate
              ? new Date(selectedTrip.tripDate).toLocaleDateString()
              : "N/A"}
          </p>

          <p className="mb-2">
            <strong>Selected Seats:</strong>{" "}
            {selectedSeatNumbers.length > 0
              ? selectedSeatNumbers.join(", ")
              : "No seats selected"}
          </p>

          <p className="mb-3">
            <strong>Total:</strong> Rs. {totalAmount}
          </p>

          <button
            className="btn btn-primary"
            onClick={createBooking}
            disabled={loading || !selectedTrip}
          >
            {loading ? "Creating Booking..." : "Create Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
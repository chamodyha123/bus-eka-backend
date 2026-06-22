"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function BookingSuccessPage() {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data.data || null);
    } catch (err) {
      console.error(err);
      alert("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">
          Loading booking details...
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Booking not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="text-success fw-bold">Booking Confirmed</h2>
            <p className="text-muted mb-0">
              Your booking has been created successfully.
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="border rounded-3 p-3 h-100">
                <h5 className="mb-3">Booking Details</h5>

                <p className="mb-2">
                  <strong>Booking ID:</strong> {booking.id}
                </p>

                <p className="mb-2">
                  <strong>Status:</strong>{" "}
                  <span className="badge bg-primary">
                    {booking.status}
                  </span>
                </p>

                <p className="mb-2">
                  <strong>Payment:</strong>{" "}
                  <span className="badge bg-warning text-dark">
                    {booking.paymentStatus}
                  </span>
                </p>

                <p className="mb-2">
                  <strong>Total Amount:</strong> Rs. {booking.totalAmount}
                </p>

                <p className="mb-2">
                  <strong>Booked At:</strong>{" "}
                  {booking.createdAt
                    ? new Date(booking.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded-3 p-3 h-100">
                <h5 className="mb-3">Trip / Bus Details</h5>

                <p className="mb-2">
                  <strong>Bus:</strong>{" "}
                  {booking.trip?.bus?.licensePlate || "N/A"}
                </p>

                <p className="mb-2">
                  <strong>Trip:</strong>{" "}
                  {booking.trip
                    ? `${booking.trip.departureCity} → ${booking.trip.arrivalCity}`
                    : "N/A"}
                </p>

                <p className="mb-2">
                  <strong>Departure:</strong>{" "}
                  {booking.trip?.departureTime
                    ? new Date(booking.trip.departureTime).toLocaleString()
                    : "N/A"}
                </p>

                <p className="mb-2">
                  <strong>Arrival:</strong>{" "}
                  {booking.trip?.arrivalTime
                    ? new Date(booking.trip.arrivalTime).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-3 p-3 mt-4">
            <h5 className="mb-3">Selected Seats</h5>

            {booking.seats && booking.seats.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {booking.seats.map((seat) => (
                  <span
                    key={seat.id}
                    className="badge bg-success fs-6 px-3 py-2"
                  >
                    {seat.seatNumber}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">
                No seat details available
              </p>
            )}
          </div>

          <div className="d-flex flex-wrap gap-3 mt-4">
            <Link
              href="/dashboard/passenger/tickets"
              className="btn btn-primary"
            >
              Go to My Tickets
            </Link>

            <Link
              href="/dashboard/passenger"
              className="btn btn-outline-secondary"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
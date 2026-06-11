"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function TicketsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await api.get("/bookings/my");

      setBookings(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>My Tickets</h2>

      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="card mb-3"
        >
          <div className="card-body">

            <h5>
              Ticket #{booking.id}
            </h5>

            <p>
              Status: {booking.status}
            </p>

            <p>
              Payment: {booking.paymentStatus}
            </p>

            <p>
              Route:
              {" "}
              {booking.trip?.route?.startLocation}
              {" → "}
              {booking.trip?.route?.endLocation}
            </p>

            <p>
              Bus:
              {" "}
              {booking.trip?.bus?.licensePlate}
            </p>

            <p>
              Seats:
              {" "}
              {booking.seats
                ?.map((s) => s.seatNumber)
                .join(", ")}
            </p>

            {booking.qrCode && (
              <>
                <h6>QR Ticket</h6>

                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.qrCode}`}
                  alt="QR Ticket"
                />
              </>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}
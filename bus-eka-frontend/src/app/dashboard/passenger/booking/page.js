"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import socket from "@/lib/socket";

export default function BookingPage() {
  const [busId, setBusId] = useState("");
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const fetchSeats = async () => {
    if (!busId) return;

    try {
      const res = await api.get(`/seats/bus/${busId}`);
      setSeats(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

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

  const selectSeat = async (seat) => {
    if (seat.status !== "AVAILABLE") return;

    try {
      await api.post("/seats/lock", {
        seatId: seat.id
      });

      setSelectedSeats((prev) => [...prev, seat.id]);

      setSeats((prev) =>
        prev.map((s) =>
          s.id === seat.id
            ? { ...s, status: "LOCKED" }
            : s
        )
      );
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const createBooking = async () => {
    try {
      const tripId = prompt("Enter Trip ID");

      const res = await api.post("/bookings", {
        tripId: Number(tripId),
        seatIds: selectedSeats
      });

      alert("Booking Created");

      console.log(res.data);

    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="container mt-4">

      <h2>Seat Booking</h2>

      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Bus ID"
          value={busId}
          onChange={(e) => setBusId(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary mb-4"
        onClick={fetchSeats}
      >
        Load Seats
      </button>

      <div className="row">
        {seats.map((seat) => (
          <div
            key={seat.id}
            className="col-md-2 mb-3"
          >
            <button
              className={`btn w-100 ${
                seat.status === "AVAILABLE"
                  ? "btn-success"
                  : seat.status === "LOCKED"
                  ? "btn-warning"
                  : "btn-danger"
              }`}
              onClick={() => selectSeat(seat)}
            >
              {seat.seatNumber}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h5>
          Selected Seats: {selectedSeats.length}
        </h5>

        <button
          className="btn btn-dark"
          onClick={createBooking}
        >
          Create Booking
        </button>
      </div>

    </div>
  );
}
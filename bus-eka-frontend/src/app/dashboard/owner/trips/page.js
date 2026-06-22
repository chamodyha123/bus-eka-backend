"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function OwnerTripsPage() {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [trips, setTrips] = useState([]);

  const [tripDate, setTripDate] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const [arrivalCity, setArrivalCity] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [price, setPrice] = useState("");

  const [editingTripId, setEditingTripId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOwnerBuses();
  }, []);

  const loadOwnerBuses = async () => {
    try {
      const res = await api.get("/buses");
      setBuses(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load buses");
    }
  };

  const loadTrips = async (busId) => {
    try {
      setSelectedBus(busId);
      const res = await api.get(`/trips/bus/${busId}`);
      setTrips(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load trips");
    }
  };

  const resetForm = () => {
    setTripDate("");
    setDepartureCity("");
    setArrivalCity("");
    setDepartureTime("");
    setArrivalTime("");
    setPrice("");
    setEditingTripId(null);
  };

  const handleSubmit = async () => {
    if (!selectedBus) {
      alert("Please select a bus first");
      return;
    }

    if (
      !tripDate ||
      !departureCity ||
      !arrivalCity ||
      !departureTime ||
      !arrivalTime ||
      !price
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        busId: Number(selectedBus),
        tripDate,
        departureCity,
        arrivalCity,
        departureTime,
        arrivalTime,
        price: Number(price),
      };

      if (editingTripId) {
        await api.put(`/trips/${editingTripId}`, payload);
        alert("Trip updated successfully");
      } else {
        await api.post("/trips", payload);
        alert("Trip created successfully");
      }

      resetForm();
      loadTrips(selectedBus);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save trip");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trip) => {
    setEditingTripId(trip.id);
    setTripDate(
      trip.tripDate ? new Date(trip.tripDate).toISOString().split("T")[0] : ""
    );
    setDepartureCity(trip.departureCity || "");
    setArrivalCity(trip.arrivalCity || "");
    setDepartureTime(trip.departureTime || "");
    setArrivalTime(trip.arrivalTime || "");
    setPrice(trip.price || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteTrip = async (tripId) => {
    const ok = confirm("Are you sure you want to delete this trip?");
    if (!ok) return;

    try {
      await api.delete(`/trips/${tripId}`);
      alert("Trip deleted successfully");
      loadTrips(selectedBus);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete trip");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manage Trips</h2>

      {/* BUS LIST */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">My Buses</h5>

          {buses.length === 0 ? (
            <div className="alert alert-warning mb-0">No buses found</div>
          ) : (
            <div className="row">
              {buses.map((bus) => (
                <div key={bus.id} className="col-md-4 mb-3">
                  <div
                    className={`card h-100 ${
                      selectedBus === bus.id ? "border-primary" : ""
                    }`}
                  >
                    <div className="card-body">
                      <h5>{bus.licensePlate}</h5>

                      <p className="mb-1">
                        <strong>Category:</strong> {bus.category || "N/A"}
                      </p>

                      <p className="mb-3">
                        <strong>Type:</strong> {bus.busType || "N/A"}
                      </p>

                      <button
                        className="btn btn-primary w-100"
                        onClick={() => loadTrips(bus.id)}
                      >
                        Manage Trips
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE / UPDATE TRIP */}
      {selectedBus && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3">
              {editingTripId
                ? `Update Trip for Bus #${selectedBus}`
                : `Create Trip for Bus #${selectedBus}`}
            </h5>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Trip Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Ticket Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Departure City</label>
                <input
                  type="text"
                  className="form-control"
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  placeholder="e.g. Colombo"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Arrival City</label>
                <input
                  type="text"
                  className="form-control"
                  value={arrivalCity}
                  onChange={(e) => setArrivalCity(e.target.value)}
                  placeholder="e.g. Kandy"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Departure Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Arrival Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                />
              </div>

              <div className="col-md-6 d-flex align-items-end">
                <button
                  className={`btn w-100 ${
                    editingTripId ? "btn-warning" : "btn-success"
                  }`}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? editingTripId
                      ? "Updating..."
                      : "Creating..."
                    : editingTripId
                    ? "Update Trip"
                    : "Create Trip"}
                </button>
              </div>

              {editingTripId && (
                <div className="col-md-6 d-flex align-items-end">
                  <button
                    className="btn btn-secondary w-100"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRIP LIST */}
      {selectedBus && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-3">Trips</h5>

            {trips.length === 0 ? (
              <div className="alert alert-info mb-0">
                No trips found for this bus
              </div>
            ) : (
              trips.map((trip) => (
                <div key={trip.id} className="card mb-3">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h6 className="mb-2">
                          {trip.departureCity} → {trip.arrivalCity}
                        </h6>

                        <p className="mb-1">
                          <strong>Trip Code:</strong> {trip.tripCode}
                        </p>

                        <p className="mb-1">
                          <strong>Date:</strong>{" "}
                          {trip.tripDate
                            ? new Date(trip.tripDate).toLocaleDateString()
                            : "N/A"}
                        </p>

                        <p className="mb-1">
                          <strong>Departure Time:</strong> {trip.departureTime}
                        </p>

                        <p className="mb-1">
                          <strong>Arrival Time:</strong> {trip.arrivalTime}
                        </p>

                        <p className="mb-1">
                          <strong>Price:</strong> Rs. {trip.price}
                        </p>

                        <p className="mb-0">
                          <strong>Status:</strong>{" "}
                          <span
                            className={`badge ${
                              trip.status === "ACTIVE"
                                ? "bg-success"
                                : trip.status === "CANCELLED"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            {trip.status}
                          </span>
                        </p>
                      </div>

                      <div className="col-md-4 text-md-end mt-3 mt-md-0 d-flex flex-column gap-2">
                        <button
                          className="btn btn-warning"
                          onClick={() => handleEdit(trip)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-danger"
                          onClick={() => deleteTrip(trip.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
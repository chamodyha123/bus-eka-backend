"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function BookingSearchPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  const router = useRouter();

  const searchRoutes = async () => {
    try {
      const res = await api.get(
        `/routes/search?start=${start}&end=${end}`
      );

      setRoutes(res.data.data || []);
      setBuses([]);
      setSelectedRouteId(null);
    } catch (err) {
      console.log(err);
      alert("Failed to search routes");
    }
  };

  const loadBuses = async (routeId) => {
    try {
      const res = await api.get(`/buses/route/${routeId}`);

      setSelectedRouteId(routeId);
      setBuses(res.data.data || []);
    } catch (err) {
      console.log(err);
      alert("Failed to load buses");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Book Seats</h2>

      <div className="row mb-4">
        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="Start Location"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="End Location"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <button
            className="btn btn-primary w-100"
            onClick={searchRoutes}
          >
            Search
          </button>
        </div>
      </div>

      {/* ROUTES */}
      {routes.map((route) => (
        <div key={route.id} className="card mb-3 shadow-sm">
          <div className="card-body">
            <h5>Route {route.routeNumber}</h5>
            <p className="mb-3">
              {route.startLocation} → {route.endLocation}
            </p>

            <button
              className="btn btn-warning"
              onClick={() => loadBuses(route.id)}
            >
              View Buses
            </button>
          </div>
        </div>
      ))}

      {/* BUSES */}
      {selectedRouteId && (
        <>
          <h4 className="mt-4 mb-3">Available Buses</h4>

          {buses.length === 0 ? (
            <div className="alert alert-warning">
              No buses found for this route
            </div>
          ) : (
            buses.map((bus) => (
              <div key={bus.id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <h5>{bus.licensePlate}</h5>

                  <p className="mb-1">
                    <strong>Category:</strong> {bus.category || "N/A"}
                  </p>

                  <p className="mb-3">
                    <strong>Type:</strong> {bus.busType || "N/A"}
                  </p>

                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      router.push(
                        `/dashboard/passenger/booking/${bus.id}`
                      )
                    }
                  >
                    Book Seats
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
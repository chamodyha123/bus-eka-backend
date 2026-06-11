"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await api.get("/routes");

      setRoutes(res.data);
      setFilteredRoutes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await api.get(
        `/routes/search?start=${start}&end=${end}`
      );

      setFilteredRoutes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Search Routes</h2>

      <div className="row mb-4">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Start Location"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="End Location"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <button
            className="btn btn-primary w-100"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      <div className="row">
        {filteredRoutes.map((route) => (
          <div className="col-md-6 mb-3" key={route.id}>
            <div className="card">
              <div className="card-body">

                <h5>
                  Route {route.routeNumber}
                </h5>

                <p>
                  <strong>From:</strong>{" "}
                  {route.startLocation}
                </p>

                <p>
                  <strong>To:</strong>{" "}
                  {route.endLocation}
                </p>

                <p>
                  <strong>Departure:</strong>{" "}
                  {route.departureTime}
                </p>

                <p>
                  <strong>Arrival:</strong>{" "}
                  {route.arrivalTime}
                </p>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
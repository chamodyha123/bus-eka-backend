"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function TrackingSearchPage() {
  const router = useRouter();

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);

  const searchRoutes = async () => {
    try {
      const res = await api.get(
        `/routes/search?start=${start}&end=${end}`
      );

      setRoutes(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadBuses = async (routeId) => {
    try {
      const res = await api.get(
        `/buses/route/${routeId}`
      );

      setBuses(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mt-4">

      <h2>Track a Bus</h2>

      <div className="row mb-3">

        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="Start Location"
            value={start}
            onChange={(e)=>setStart(e.target.value)}
          />
        </div>

        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="End Location"
            value={end}
            onChange={(e)=>setEnd(e.target.value)}
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

      {routes.map((route) => (
        <div
          key={route.id}
          className="card mb-3"
        >
          <div className="card-body">

            <h5>
              Route {route.routeNumber}
            </h5>

            <p>
              {route.startLocation}
              {" → "}
              {route.endLocation}
            </p>

            <button
              className="btn btn-warning"
              onClick={() =>
                loadBuses(route.id)
              }
            >
              Show Buses
            </button>

          </div>
        </div>
      ))}

      {buses.length > 0 && (
        <>
          <h4 className="mt-4">
            Available Buses
          </h4>

          {buses.map((bus) => (
            <div
              key={bus.id}
              className="card mb-2"
            >
              <div className="card-body">

                <h5>
                  {bus.licensePlate}
                </h5>

                <button
                  className="btn btn-success"
                  onClick={() =>
                    router.push(
                      `/dashboard/passenger/tracking/${bus.id}`
                    )
                  }
                >
                  Track Bus
                </button>

              </div>
            </div>
          ))}
        </>
      )}

    </div>
  );
}
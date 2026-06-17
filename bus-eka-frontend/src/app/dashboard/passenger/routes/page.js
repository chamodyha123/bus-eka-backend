"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [buses, setBuses] = useState([]);

  const router = useRouter();

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const res = await api.get("/routes");

      setRoutes(res.data.data || res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadBuses = async (routeId) => {
    try {
      const res = await api.get(
        `/buses/route/${routeId}`
      );

      setSelectedRoute(routeId);
      setBuses(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mt-4">

      <h2 className="mb-4">
        Available Routes
      </h2>

      {/* ROUTES */}

      <div className="row">
        {routes.map((route) => (
          <div
            key={route.id}
            className="col-md-6 mb-3"
          >
            <div className="card shadow-sm">
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

                <button
                  className="btn btn-warning"
                  onClick={() =>
                    loadBuses(route.id)
                  }
                >
                  View Buses
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BUSES */}

      {selectedRoute && (
        <>
          <hr />

          <h3 className="mt-4 mb-3">
            Available Buses
          </h3>

          <div className="row">
            {buses.map((bus) => (
              <div
                key={bus.id}
                className="col-md-6 mb-3"
              >
                <div className="card border-primary">
                  <div className="card-body">

                    <h5>
                      {bus.licensePlate}
                    </h5>

                    <p>
                      Type: {bus.busType}
                    </p>

                    <p>
                      Category: {bus.category}
                    </p>

                    <button
                      className="btn btn-success me-2"
                      onClick={() =>
                        router.push(
                          `/dashboard/passenger/tracking/${bus.id}`
                        )
                      }
                    >
                      Track Bus
                    </button>

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
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
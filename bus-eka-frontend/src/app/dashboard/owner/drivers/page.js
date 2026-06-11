"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function DriversPage() {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/buses");
      setBuses(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Drivers</h2>

      {buses.map((bus) => (
        <div key={bus.id} className="card mb-3">
          <div className="card-body">

            <h5>{bus.licensePlate}</h5>

            {bus.drivers?.length > 0 ? (
              bus.drivers.map((driver) => (
                <div key={driver.id}>
                  <p>
                    License:
                    {" "}
                    {driver.licenseNumber}
                  </p>
                </div>
              ))
            ) : (
              <p>No Driver Assigned</p>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}
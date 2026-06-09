"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function OwnerDashboard() {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    const fetchBuses = async () => {
      const res = await api.get("/bus");
      setBuses(res.data.data);
    };

    fetchBuses();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>

      <div className="grid gap-4">
        {buses.map((bus) => (
          <div key={bus.id} className="bg-white p-4 shadow rounded">
            <p>🚍 {bus.licensePlate}</p>
            <p>Type: {bus.busType}</p>
            <p>Seats: {bus.seatCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
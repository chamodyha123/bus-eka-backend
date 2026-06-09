"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get("/admin/stats");
      setStats(res.data.data);
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white shadow rounded">
            Users: {stats.totalUsers}
          </div>

          <div className="p-4 bg-white shadow rounded">
            Buses: {stats.totalBuses}
          </div>

          <div className="p-4 bg-white shadow rounded">
            Routes: {stats.totalRoutes}
          </div>

          <div className="p-4 bg-white shadow rounded">
            Emergencies: {stats.totalEmergency}
          </div>
        </div>
      )}
    </div>
  );
}
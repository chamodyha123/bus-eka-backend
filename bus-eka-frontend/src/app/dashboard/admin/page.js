"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <h1>Admin Dashboard</h1>

      <div className="row mt-4">

        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3>{stats.totalUsers}</h3>
              <p>Users</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3>{stats.totalBuses}</h3>
              <p>Buses</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3>{stats.totalRoutes}</h3>
              <p>Routes</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3>{stats.totalEmergency}</h3>
              <p>Emergencies</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
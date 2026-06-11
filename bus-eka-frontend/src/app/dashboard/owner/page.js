"use client";

import Link from "next/link";

export default function OwnerDashboard() {
  return (
    <div className="container mt-4">
      <h1>Owner Dashboard</h1>

      <div className="row mt-4">

        <div className="col-md-3">
          <Link
            href="/dashboard/owner/buses"
            className="btn btn-primary w-100"
          >
            My Buses
          </Link>
        </div>

        <div className="col-md-3">
          <Link
            href="/dashboard/owner/drivers"
            className="btn btn-success w-100"
          >
            Drivers
          </Link>
        </div>

        <div className="col-md-3">
          <Link
            href="/dashboard/owner/revenue"
            className="btn btn-warning w-100"
          >
            Revenue
          </Link>
        </div>

        <div className="col-md-3">
          <Link
            href="/dashboard/passenger/tracking"
            className="btn btn-info w-100"
          >
            Track Buses
          </Link>
        </div>

      </div>
    </div>
  );
}
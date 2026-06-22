"use client";

import Link from "next/link";

export default function PassengerDashboard() {
  return (
    <div className="container mt-5">
      <h2>Passenger Dashboard</h2>

      <div className="row mt-4">

        <div className="col-md-4 mb-3">
          <Link href="/dashboard/passenger/routes">
            <div className="card p-4 text-center">
              Search Routes
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-3">
          <Link href="/dashboard/passenger/tracking">
            <div className="card p-4 text-center">
              Live Bus Tracking
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-3">
          <Link href="/dashboard/passenger/booking">
            <div className="card p-4 text-center">
              Book Seats
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-3">
          <Link href="/dashboard/passenger/tickets">
            <div className="card p-4 text-center">
              My Tickets
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-3">
          <Link href="/dashboard/passenger/emergency">
            <div className="card p-4 text-center">
              Emergency Report
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-3">
          <Link href="/dashboard/passenger/notifications">
            <div className="card p-4 text-center">
              Notifications
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-3">
  <Link href="/dashboard/passenger/profile">
    <div className="card p-4 text-center">
      My Profile
    </div>
  </Link>
</div>

      </div>
    </div>
  );
}
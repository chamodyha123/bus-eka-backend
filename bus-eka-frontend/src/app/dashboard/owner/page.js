"use client";

import Link from "next/link";

export default function OwnerDashboard() {
  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h1 className="fw-bold">Owner Dashboard</h1>
        <p className="text-muted mb-0">
          Manage your buses, routes, trips, drivers, revenue, and schedule updates.
        </p>
      </div>

      <div className="row g-4">
        {/* MY BUSES */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3 fs-1">🚌</div>
              <h5 className="fw-bold">My Buses</h5>
              <p className="text-muted small">
                View and manage all buses registered under your account.
              </p>

              <Link
                href="/dashboard/owner/buses"
                className="btn btn-primary w-100"
              >
                Manage Buses
              </Link>
            </div>
          </div>
        </div>

        {/* MANAGE ROUTES */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3 fs-1">🛣️</div>
              <h5 className="fw-bold">Manage Routes</h5>
              <p className="text-muted small">
                Create, update, and manage bus routes, route numbers, and timings.
              </p>

              <Link
                href="/dashboard/owner/routes"
                className="btn btn-secondary w-100"
              >
                Manage Routes
              </Link>
            </div>
          </div>
        </div>

        {/* DRIVERS */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3 fs-1">👨‍✈️</div>
              <h5 className="fw-bold">Drivers</h5>
              <p className="text-muted small">
                Assign drivers and manage driver details for your buses.
              </p>

              <Link
                href="/dashboard/owner/drivers"
                className="btn btn-success w-100"
              >
                Manage Drivers
              </Link>
            </div>
          </div>
        </div>

        {/* REVENUE */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3 fs-1">💰</div>
              <h5 className="fw-bold">Revenue</h5>
              <p className="text-muted small">
                Track ticket income, bookings, and bus revenue reports.
              </p>

              <Link
                href="/dashboard/owner/revenue"
                className="btn btn-warning w-100"
              >
                View Revenue
              </Link>
            </div>
          </div>
        </div>

        {/* MANAGE TRIPS */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3 fs-1">📅</div>
              <h5 className="fw-bold">Manage Trips</h5>
              <p className="text-muted small">
                Create daily trips, update trip schedules, and manage routes.
              </p>

              <Link
                href="/dashboard/owner/trips"
                className="btn btn-info w-100 text-white"
              >
                Manage Trips
              </Link>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3 fs-1">🔔</div>
              <h5 className="fw-bold">Notifications</h5>
              <p className="text-muted small">
                Send trip delay, cancellation, and schedule update notifications
                to passengers.
              </p>

              <Link
                href="/dashboard/owner/notifications"
                className="btn btn-dark w-100"
              >
                View Notifications
              </Link>
            </div>
          </div>
        </div>

        {/* TRACKING */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3 fs-1">📍</div>
              <h5 className="fw-bold">Bus Tracking</h5>
              <p className="text-muted small">
                Monitor live location and route progress of your buses.
              </p>

              <Link
                href="/dashboard/passenger/tracking"
                className="btn btn-secondary w-100"
              >
                Track Buses
              </Link>
            </div>
          </div>
        </div>

        {/* BOOKINGS */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3 fs-1">🎟️</div>
              <h5 className="fw-bold">Bookings</h5>
              <p className="text-muted small">
                View passenger bookings, seat reservations, and booking history.
              </p>

              <Link
                href="/dashboard/owner/bookings"
                className="btn btn-danger w-100"
              >
                View Bookings
              </Link>
            </div>
          </div>
        </div>

        {/* REPORTS */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3 fs-1">📊</div>
              <h5 className="fw-bold">Reports</h5>
              <p className="text-muted small">
                Check bus performance, occupancy rates, and route statistics.
              </p>

              <Link
                href="/dashboard/owner/reports"
                className="btn btn-outline-primary w-100"
              >
                View Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
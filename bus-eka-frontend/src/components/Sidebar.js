"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-purple-800 text-white">

      <div className="p-6 text-2xl font-bold border-b border-purple-600">
        🚌 Bus Eka
      </div>

      <nav className="flex flex-col p-4 gap-2">

        <Link
          href="/dashboard/passenger"
          className="p-3 rounded hover:bg-purple-700"
        >
          Dashboard
        </Link>

        <Link
          href="/routes"
          className="p-3 rounded hover:bg-purple-700"
        >
          Routes
        </Link>

        <Link
          href="/tracking"
          className="p-3 rounded hover:bg-purple-700"
        >
          Live Tracking
        </Link>

        <Link
          href="/bookings"
          className="p-3 rounded hover:bg-purple-700"
        >
          My Bookings
        </Link>

      </nav>
    </div>
  );
}
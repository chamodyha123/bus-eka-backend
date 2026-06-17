"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="gradient-bg text-white px-6 py-4 flex justify-between">

      <h1 className="font-bold text-xl">
        🚌 Bus Eka LK
      </h1>

      <div className="space-x-4">
        <Link href="/">Home</Link>
        <Link href="/routes">Routes</Link>
        <Link href="/tracking">Tracking</Link>
        <Link href="/login">Login</Link>
      </div>

    </nav>
  );
}
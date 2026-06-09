"use client";

import { useEffect } from "react";
import socket from "@/lib/socket";

export default function DriverDashboard() {
  useEffect(() => {
    socket.on("busLocationUpdated", (data) => {
      console.log("Live location:", data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Driver Dashboard</h1>

      <p>📍 Live tracking active</p>
      <p>🚨 Emergency alerts enabled</p>
    </div>
  );
}
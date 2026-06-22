"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          User not loaded
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">

        <div className="card-header bg-primary text-white">
          <h3>My Profile</h3>
        </div>

        <div className="card-body">

          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>

          <button
            className="btn btn-danger mt-3"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </div>
    </div>
  );
}
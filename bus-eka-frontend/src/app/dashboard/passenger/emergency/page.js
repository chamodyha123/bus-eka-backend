"use client";

import { useState, useContext } from "react";
import api from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";

export default function EmergencyPage() {
  const { user } = useContext(AuthContext);

  const [licensePlate, setLicensePlate] = useState("");
  const [emergencyType, setEmergencyType] = useState("ACCIDENT");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!licensePlate || !emergencyType || !description) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      let latitude = null;
      let longitude = null;

      // Try to get current location
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        }).catch(() => null);

        if (position) {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      }

      await api.post("/emergency", {
        licensePlate,
        emergencyType,
        description,
        latitude,
        longitude,
        userId: user?.id,
      });

      alert("Emergency report sent successfully");

      setLicensePlate("");
      setEmergencyType("ACCIDENT");
      setDescription("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send emergency report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4">
          <h2 className="mb-4 text-danger fw-bold">Emergency Report</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Bus License Plate</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter bus license plate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Emergency Type</label>
              <select
                className="form-select"
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
              >
                <option value="ACCIDENT">Accident</option>
                <option value="HARASSMENT">Harassment</option>
                <option value="THEFT">Theft</option>
                <option value="MEDICAL">Medical Emergency</option>
                <option value="OVERCROWDING">Overcrowding</option>
                <option value="DRIVER_BEHAVIOR">Driver Behavior</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control"
                rows="5"
                placeholder="Describe the emergency..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-danger w-100"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Emergency Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
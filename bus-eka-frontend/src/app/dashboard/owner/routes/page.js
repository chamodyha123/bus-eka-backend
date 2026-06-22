"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function OwnerRoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState(null);

  const [form, setForm] = useState({
    routeNumber: "",
    routePermitNumber: "",
    startLocation: "",
    endLocation: "",
    distanceKm: ""
  });

  useEffect(() => {
    loadRoutes();
  }, []);

  // ======================================================
  // LOAD ROUTES
  // ======================================================
  const loadRoutes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/routes");
      setRoutes(res.data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // RESET FORM
  // ======================================================
  const resetForm = () => {
    setEditingRouteId(null);
    setForm({
      routeNumber: "",
      routePermitNumber: "",
      startLocation: "",
      endLocation: "",
      distanceKm: ""
    });
  };

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // ======================================================
  // CREATE / UPDATE ROUTE
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.routeNumber.trim() ||
      !form.routePermitNumber.trim() ||
      !form.startLocation.trim() ||
      !form.endLocation.trim()
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        routeNumber: form.routeNumber.trim(),
        routePermitNumber: form.routePermitNumber.trim(),
        startLocation: form.startLocation.trim(),
        endLocation: form.endLocation.trim(),
        distanceKm:
          form.distanceKm === "" ? null : Number(form.distanceKm)
      };

      if (editingRouteId) {
        await api.put(`/routes/${editingRouteId}`, payload);
        alert("Route updated successfully");
      } else {
        await api.post("/routes", payload);
        alert("Route created successfully");
      }

      resetForm();
      await loadRoutes();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save route");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // EDIT ROUTE
  // ======================================================
  const handleEdit = (route) => {
    setEditingRouteId(route.id);
    setForm({
      routeNumber: route.routeNumber || "",
      routePermitNumber: route.routePermitNumber || "",
      startLocation: route.startLocation || "",
      endLocation: route.endLocation || "",
      distanceKm:
        route.distanceKm !== null && route.distanceKm !== undefined
          ? String(route.distanceKm)
          : ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // ======================================================
  // DELETE ROUTE
  // ======================================================
  const handleDelete = async (id) => {
    const ok = confirm("Are you sure you want to delete this route?");
    if (!ok) return;

    try {
      setLoading(true);
      await api.delete(`/routes/${id}`);
      alert("Route deleted successfully");

      if (editingRouteId === id) {
        resetForm();
      }

      await loadRoutes();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      {/* PAGE HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold">Manage Routes</h2>
        <p className="text-muted mb-0">
          Create, update, and manage bus routes with route permit numbers and
          locations.
        </p>
      </div>

      {/* ====================================================== */}
      {/* ROUTE FORM */}
      {/* ====================================================== */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">
            {editingRouteId ? "Edit Route" : "Add New Route"}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* ROUTE NUMBER */}
              <div className="col-md-6">
                <label className="form-label">Route Number *</label>
                <input
                  type="text"
                  className="form-control"
                  name="routeNumber"
                  value={form.routeNumber}
                  onChange={handleChange}
                  placeholder="e.g. 122"
                />
              </div>

              {/* ROUTE PERMIT NUMBER */}
              <div className="col-md-6">
                <label className="form-label">Route Permit Number *</label>
                <input
                  type="text"
                  className="form-control"
                  name="routePermitNumber"
                  value={form.routePermitNumber}
                  onChange={handleChange}
                  placeholder="e.g. RP-2026-001"
                />
              </div>

              {/* START LOCATION */}
              <div className="col-md-6">
                <label className="form-label">Start Location *</label>
                <input
                  type="text"
                  className="form-control"
                  name="startLocation"
                  value={form.startLocation}
                  onChange={handleChange}
                  placeholder="e.g. Colombo"
                />
              </div>

              {/* END LOCATION */}
              <div className="col-md-6">
                <label className="form-label">End Location *</label>
                <input
                  type="text"
                  className="form-control"
                  name="endLocation"
                  value={form.endLocation}
                  onChange={handleChange}
                  placeholder="e.g. Avissawella"
                />
              </div>

              {/* DISTANCE */}
              <div className="col-md-6">
                <label className="form-label">Distance (KM)</label>
                <input
                  type="number"
                  className="form-control"
                  name="distanceKm"
                  value={form.distanceKm}
                  onChange={handleChange}
                  placeholder="e.g. 55"
                  min="0"
                  step="0.1"
                />
              </div>

              {/* BUTTONS */}
              <div className="col-12 d-flex gap-2 mt-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? editingRouteId
                      ? "Updating..."
                      : "Creating..."
                    : editingRouteId
                    ? "Update Route"
                    : "Create Route"}
                </button>

                {editingRouteId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ====================================================== */}
      {/* ROUTES LIST */}
      {/* ====================================================== */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">All Routes</h5>

          {loading && routes.length === 0 ? (
            <div className="alert alert-info mb-0">Loading routes...</div>
          ) : routes.length === 0 ? (
            <div className="alert alert-warning mb-0">No routes found</div>
          ) : (
            <div className="row">
              {routes.map((route) => (
                <div key={route.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">
                          Route {route.routeNumber}
                        </h5>
                        <span className="badge bg-secondary">
                          #{route.id}
                        </span>
                      </div>

                      <p className="mb-1">
                        <strong>Permit No:</strong> {route.routePermitNumber}
                      </p>

                      <p className="mb-1">
                        <strong>From:</strong> {route.startLocation}
                      </p>

                      <p className="mb-1">
                        <strong>To:</strong> {route.endLocation}
                      </p>

                      <p className="mb-1">
                        <strong>Distance:</strong>{" "}
                        {route.distanceKm !== null &&
                        route.distanceKm !== undefined
                          ? `${route.distanceKm} KM`
                          : "N/A"}
                      </p>

                      <p className="mb-0">
                        <strong>Buses Assigned:</strong>{" "}
                        {route.buses?.length || 0}
                      </p>
                    </div>

                    <div className="card-footer bg-white border-0 d-flex gap-2">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(route)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(route.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
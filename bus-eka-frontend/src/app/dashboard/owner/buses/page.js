"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function OwnerBusesPage() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingBusId, setEditingBusId] = useState(null);

  const [form, setForm] = useState({
    licensePlate: "",
    routePermitNumber: "",
    busType: "",
    category: "",
    seatCount: "",
    seatLayout: "2x2",
    imageUrl: ""
  });

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/buses");
      setBuses(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load buses");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingBusId(null);
    setForm({
      licensePlate: "",
      routePermitNumber: "",
      busType: "",
      category: "",
      seatCount: "",
      seatLayout: "2x2",
      imageUrl: ""
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    if (!form.licensePlate || !form.busType || !form.category || !form.seatCount) {
      alert("Please fill required fields");
      return;
    }

    try {
      const payload = {
        licensePlate: form.licensePlate,
        routePermitNumber: form.routePermitNumber || null,
        busType: form.busType,
        category: form.category,
        seatCount: Number(form.seatCount),
        seatLayout: form.seatLayout,
        imageUrl: form.imageUrl || null
      };

      if (editingBusId) {
        await api.put(`/buses/${editingBusId}`, payload);
        alert("Bus updated successfully");
      } else {
        await api.post("/buses", payload);
        alert("Bus created successfully");
      }

      resetForm();
      loadBuses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save bus");
    }
  };

  const handleEdit = (bus) => {
    setEditingBusId(bus.id);
    setForm({
      licensePlate: bus.licensePlate || "",
      routePermitNumber: bus.routePermitNumber || "",
      busType: bus.busType || "",
      category: bus.category || "",
      seatCount: bus.seatCount || "",
      seatLayout: bus.seatLayout || "2x2",
      imageUrl: bus.imageUrl || ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = confirm("Delete this bus?");
    if (!ok) return;

    try {
      await api.delete(`/buses/${id}`);
      alert("Bus deleted successfully");
      loadBuses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete bus");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Manage Buses</h2>

      {/* FORM */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">{editingBusId ? "Edit Bus" : "Add New Bus"}</h5>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">License Plate *</label>
              <input
                type="text"
                className="form-control"
                name="licensePlate"
                value={form.licensePlate}
                onChange={handleChange}
                placeholder="e.g. NC-1234"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Route Permit Number</label>
              <input
                type="text"
                className="form-control"
                name="routePermitNumber"
                value={form.routePermitNumber}
                onChange={handleChange}
                placeholder="Enter route permit number"
              />
              <small className="text-muted">
                Enter the route permit number used in the Route table.
              </small>
            </div>

            <div className="col-md-4">
              <label className="form-label">Bus Type *</label>
              <input
                type="text"
                className="form-control"
                name="busType"
                value={form.busType}
                onChange={handleChange}
                placeholder="e.g. Luxury / Normal"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Category *</label>
              <input
                type="text"
                className="form-control"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. AC / Non-AC"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Seat Count *</label>
              <input
                type="number"
                className="form-control"
                name="seatCount"
                value={form.seatCount}
                onChange={handleChange}
                placeholder="e.g. 54"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Seat Layout</label>
              <select
                className="form-select"
                name="seatLayout"
                value={form.seatLayout}
                onChange={handleChange}
              >
                <option value="2x2">2x2</option>
                <option value="2x3">2x3</option>
                <option value="1x2">1x2</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Image URL</label>
              <input
                type="text"
                className="form-control"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingBusId ? "Update Bus" : "Create Bus"}
              </button>

              {editingBusId && (
                <button className="btn btn-secondary" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BUS LIST */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">My Buses</h5>

          {loading ? (
            <div className="alert alert-info">Loading buses...</div>
          ) : buses.length === 0 ? (
            <div className="alert alert-warning mb-0">No buses found</div>
          ) : (
            <div className="row">
              {buses.map((bus) => (
                <div key={bus.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 border-0 shadow-sm">
                    {bus.imageUrl ? (
                      <img
                        src={bus.imageUrl}
                        alt={bus.licensePlate}
                        className="card-img-top"
                        style={{ height: 180, objectFit: "cover" }}
                      />
                    ) : null}

                    <div className="card-body">
                      <h5 className="card-title">{bus.licensePlate}</h5>

                      <p className="mb-1">
                        <strong>Type:</strong> {bus.busType}
                      </p>

                      <p className="mb-1">
                        <strong>Category:</strong> {bus.category}
                      </p>

                      <p className="mb-1">
                        <strong>Seats:</strong> {bus.seatCount}
                      </p>

                      <p className="mb-1">
                        <strong>Layout:</strong> {bus.seatLayout}
                      </p>

                      <p className="mb-1">
                        <strong>Route Permit:</strong>{" "}
                        {bus.routePermitNumber || "N/A"}
                      </p>

                      <p className="mb-0">
                        <strong>Route:</strong>{" "}
                        {bus.route
                          ? `${bus.route.routeNumber} - ${bus.route.startLocation} → ${bus.route.endLocation}`
                          : "No route assigned"}
                      </p>
                    </div>

                    <div className="card-footer bg-white border-0 d-flex gap-2">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(bus)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(bus.id)}
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
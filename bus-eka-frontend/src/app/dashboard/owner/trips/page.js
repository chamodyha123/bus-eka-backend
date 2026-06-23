"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

const DEFAULT_FORM = {
  busId: "",
  routeId: "",
  departureCity: "",
  arrivalCity: "",
  departureTime: "",
  arrivalTime: "",
  price: "",
  activeDays: "MON,TUE,WED,THU,FRI,SAT,SUN",
  isActive: true
};

export default function OwnerTripsPage() {
  const [templates, setTemplates] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);

      const [templatesRes, busesRes, routesRes] = await Promise.all([
        api.get("/trip-templates"),
        api.get("/buses"),
        api.get("/routes")
      ]);

      setTemplates(templatesRes.data?.data || []);
      setBuses(busesRes.data?.data || []);
      setRoutes(routesRes.data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load trip template data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingTemplateId(null);
    setForm(DEFAULT_FORM);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (
      !form.busId ||
      !form.routeId ||
      !form.departureCity ||
      !form.arrivalCity ||
      !form.departureTime ||
      !form.arrivalTime
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        busId: Number(form.busId),
        routeId: Number(form.routeId),
        departureCity: form.departureCity,
        arrivalCity: form.arrivalCity,
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime,
        price: form.price ? Number(form.price) : 0,
        activeDays: form.activeDays,
        isActive: form.isActive
      };

      if (editingTemplateId) {
        await api.put(`/trip-templates/${editingTemplateId}`, payload);
        alert("Trip template updated successfully");
      } else {
        await api.post("/trip-templates", payload);
        alert("Trip template created successfully");
      }

      resetForm();
      loadAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save trip template");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplateId(template.id);
    setForm({
      busId: template.busId || "",
      routeId: template.routeId || "",
      departureCity: template.departureCity || "",
      arrivalCity: template.arrivalCity || "",
      departureTime: template.departureTime || "",
      arrivalTime: template.arrivalTime || "",
      price: template.price || "",
      activeDays: template.activeDays || "MON,TUE,WED,THU,FRI,SAT,SUN",
      isActive: template.isActive
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = confirm("Delete this trip template?");
    if (!ok) return;

    try {
      await api.delete(`/trip-templates/${id}`);
      alert("Trip template deleted successfully");
      loadAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete trip template");
    }
  };

  const handleGenerateTrips = async () => {
    try {
      setGenerating(true);
      const res = await api.post("/trips/generate", {});
      alert(
        res.data?.message ||
          `Trips generated. Created: ${res.data?.createdCount || 0}`
      );
      loadAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to generate trips");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Manage Trip Templates</h2>
          <p className="text-muted mb-0">
            Create reusable daily schedules. Real trips are generated from these templates.
          </p>
        </div>

        <button
          className="btn btn-success"
          onClick={handleGenerateTrips}
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate Today's Trips"}
        </button>
      </div>

      {/* FORM */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">
            {editingTemplateId ? "Edit Trip Template" : "Create Trip Template"}
          </h5>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Bus *</label>
              <select
                className="form-select"
                name="busId"
                value={form.busId}
                onChange={handleChange}
              >
                <option value="">Select Bus</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.licensePlate} ({bus.busType})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Route *</label>
              <select
                className="form-select"
                name="routeId"
                value={form.routeId}
                onChange={handleChange}
              >
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.routeNumber} | {route.startLocation} → {route.endLocation}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Departure City *</label>
              <input
                type="text"
                className="form-control"
                name="departureCity"
                value={form.departureCity}
                onChange={handleChange}
                placeholder="e.g. Colombo"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Arrival City *</label>
              <input
                type="text"
                className="form-control"
                name="arrivalCity"
                value={form.arrivalCity}
                onChange={handleChange}
                placeholder="e.g. Kandy"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Departure Time *</label>
              <input
                type="time"
                className="form-control"
                name="departureTime"
                value={form.departureTime}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Arrival Time *</label>
              <input
                type="time"
                className="form-control"
                name="arrivalTime"
                value={form.arrivalTime}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Price (Rs.)</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 500"
              />
            </div>

            <div className="col-md-8">
              <label className="form-label">Active Days</label>
              <input
                type="text"
                className="form-control"
                name="activeDays"
                value={form.activeDays}
                onChange={handleChange}
                placeholder="MON,TUE,WED,THU,FRI,SAT,SUN"
              />
              <small className="text-muted">
                Example: MON,TUE,WED,THU,FRI,SAT,SUN
              </small>
            </div>

            <div className="col-md-4 d-flex align-items-end">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="isActive">
                  Template Active
                </label>
              </div>
            </div>

            <div className="col-12 d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving
                  ? editingTemplateId
                    ? "Updating..."
                    : "Creating..."
                  : editingTemplateId
                  ? "Update Template"
                  : "Create Template"}
              </button>

              {editingTemplateId && (
                <button className="btn btn-secondary" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Trip Templates</h5>

          {loading ? (
            <div className="alert alert-info">Loading trip templates...</div>
          ) : templates.length === 0 ? (
            <div className="alert alert-warning mb-0">
              No trip templates found
            </div>
          ) : (
            <div className="row">
              {templates.map((template) => (
                <div key={template.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-2">
                        {template.departureCity} → {template.arrivalCity}
                      </h5>

                      <p className="mb-1">
                        <strong>Bus:</strong>{" "}
                        {template.bus?.licensePlate || "N/A"}
                      </p>

                      <p className="mb-1">
                        <strong>Route:</strong>{" "}
                        {template.route
                          ? `${template.route.routeNumber} (${template.route.startLocation} → ${template.route.endLocation})`
                          : "N/A"}
                      </p>

                      <p className="mb-1">
                        <strong>Departure:</strong> {template.departureTime}
                      </p>

                      <p className="mb-1">
                        <strong>Arrival:</strong> {template.arrivalTime}
                      </p>

                      <p className="mb-1">
                        <strong>Price:</strong> Rs. {template.price}
                      </p>

                      <p className="mb-1">
                        <strong>Days:</strong> {template.activeDays || "Daily"}
                      </p>

                      <p className="mb-0">
                        <strong>Status:</strong>{" "}
                        {template.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>

                    <div className="card-footer bg-white border-0 d-flex gap-2">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(template)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(template.id)}
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
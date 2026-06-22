"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      const res = await api.get(
        `/notifications/${user.id}`
      );

      setNotifications(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">

      <h2 className="mb-4">
        Notifications
      </h2>

      {loading && (
        <div className="alert alert-info">
          Loading notifications...
        </div>
      )}

      {!loading &&
        notifications.length === 0 && (
          <div className="alert alert-warning">
            No notifications found
          </div>
        )}

      {!loading &&
        notifications.map((notification) => (
          <div
            key={notification.id}
            className="card mb-3 shadow-sm"
          >
            <div className="card-body">

              <div className="d-flex justify-content-between">

                <h5>
                  {notification.title}
                </h5>

                <span className="badge bg-primary">
                  {notification.type}
                </span>

              </div>

              <p className="mt-2">
                {notification.message}
              </p>

              <small className="text-muted">
                {new Date(
                  notification.createdAt
                ).toLocaleString()}
              </small>

            </div>
          </div>
        ))}

    </div>
  );
}
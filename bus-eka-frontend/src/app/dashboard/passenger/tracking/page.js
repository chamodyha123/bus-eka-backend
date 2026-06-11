"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import api from "@/lib/api";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

export default function TrackingPage() {
  const [busId, setBusId] = useState("");
  const [location, setLocation] = useState(null);

  const loadLocation = async () => {
    try {
      const res = await api.get(
        `/tracking/${busId}`
      );

      setLocation(res.data.data);

      socket.emit(
        "joinBusRoom",
        busId
      );

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {

    socket.on(
      "busLocationUpdated",
      (data) => {

        setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          trackingSource:
            data.trackingSource
        });

      }
    );

    return () => {
      socket.off(
        "busLocationUpdated"
      );
    };

  }, []);

  return (
    <div className="container mt-4">

      <h2>
        Live Bus Tracking
      </h2>

      <input
        className="form-control mb-3"
        placeholder="Enter Bus ID"
        value={busId}
        onChange={(e) =>
          setBusId(e.target.value)
        }
      />

      <button
        className="btn btn-primary mb-3"
        onClick={loadLocation}
      >
        Track Bus
      </button>

      {location && (
        <MapContainer
          center={[
            location.latitude,
            location.longitude
          ]}
          zoom={15}
          style={{
            height: "500px"
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            position={[
              location.latitude,
              location.longitude
            ]}
          >
            <Popup>
              Bus {busId}
              <br />
              Source:
              {" "}
              {location.trackingSource}
            </Popup>
          </Marker>
        </MapContainer>
      )}

    </div>
  );
}
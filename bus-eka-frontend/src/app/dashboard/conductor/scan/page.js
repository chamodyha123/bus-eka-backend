"use client";

import { QrReader } from "react-qr-reader";
import api from "@/lib/api";

export default function ScanTicket() {

  const verifyTicket = async (qrCode) => {
    try {
      const res = await api.post(
        "/tickets/verify",
        { qrCode }
      );

      alert(
        `${res.data.passenger}
        verified successfully`
      );

    } catch (err) {
      alert(
        err.response?.data?.message
      );
    }
  };

  return (
    <div className="container mt-4">
      <h2>Scan Ticket</h2>

      <QrReader
        constraints={{
          facingMode: "environment"
        }}
        onResult={(result) => {
          if (result) {
            verifyTicket(result?.text);
          }
        }}
      />
    </div>
  );
}
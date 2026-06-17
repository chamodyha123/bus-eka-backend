"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "passenger",
    nic: "",
    phone: "",
    licenseNumber: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", form);

      alert("Registration Successful");

      router.push("/login");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Registration Failed"
      );
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">

      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow-lg w-[450px]"
      >
        <h1 className="text-2xl font-bold mb-4">
          Register
        </h1>

        <input
          name="name"
          placeholder="Full Name"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        />

        <select
          name="role"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        >
          <option value="passenger">
            Passenger
          </option>

          <option value="owner">
            Bus Owner
          </option>

          <option value="driver">
            Driver
          </option>

          <option value="conductor">
            Conductor
          </option>
        </select>

        <input
          name="nic"
          placeholder="NIC"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone"
          className="border p-2 w-full mb-2"
          onChange={handleChange}
        />

        <input
          name="licenseNumber"
          placeholder="License Number (Drivers)"
          className="border p-2 w-full mb-4"
          onChange={handleChange}
        />

        <button
          type="submit"
          className="bg-green-600 text-white p-2 w-full rounded"
        >
          Register
        </button>

      </form>
    </div>
  );
}
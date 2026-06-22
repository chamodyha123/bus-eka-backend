"use client";

import { useState, useContext } from "react";
import api from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { user, token } = res.data;

      // ✅ FIXED: correct usage
      login(user, token);

      const roleRoutes = {
        owner: "/dashboard/owner",
        passenger: "/dashboard/passenger",
        conductor: "/dashboard/conductor",
        admin: "/dashboard/admin",
      };

      router.push(roleRoutes[user.role] || "/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-yellow-400">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-purple-700">
            Bus Eka LK
          </h1>
          <p className="text-gray-500 mt-2">
            Smart Bus Management System
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter Email"
            className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-5">
          <p className="text-gray-600">New User?</p>
          <Link href="/register" className="text-blue-600 font-semibold">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
}
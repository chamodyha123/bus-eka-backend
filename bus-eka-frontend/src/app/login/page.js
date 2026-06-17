"use client";

import { useState, useContext } from "react";
import api from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
      alert("Login failed");
    }
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-slate-100">
    <form
      onSubmit={handleLogin}
      className="bg-white p-8 rounded-xl shadow-lg w-96"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Bus Eka LK
      </h1>

      <input
        className="border p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
      >
        Login
      </button>

      <p className="mt-4 text-center text-gray-600">
        New User?
        <a
          href="/register"
          className="text-purple-600 font-bold ml-2 hover:text-purple-700"
        >
          Register Here
        </a>
      </p>
    </form>
  </div>
);
}
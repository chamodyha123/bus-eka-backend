"use client";

import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// safe JSON parser
const safeParse = (value) => {
  try {
    if (!value || value === "undefined") return null;
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load from localStorage (client-side only)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    const parsedUser = safeParse(storedUser);

    if (parsedUser) {
      setUser(parsedUser);
    } else {
      localStorage.removeItem("user");
    }

    if (storedToken && storedToken !== "undefined") {
      setToken(storedToken);
    } else {
      localStorage.removeItem("token");
    }
  }, []);

  const login = (data) => {
    setUser(data.user || null);
    setToken(data.token || null);

    // safely store
    localStorage.setItem("user", JSON.stringify(data.user || null));
    localStorage.setItem("token", data.token || "");
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
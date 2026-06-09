"use client";

import { useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    switch (user.role) {
      case "admin":
        router.push("/dashboard/admin");
        break;
      case "owner":
        router.push("/dashboard/owner");
        break;
      case "driver":
        router.push("/dashboard/driver");
        break;
      case "conductor":
        router.push("/dashboard/conductor");
        break;
      default:
        router.push("/dashboard/passenger");
    }
  }, [user]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
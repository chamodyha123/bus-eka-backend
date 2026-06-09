import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">🚌 Bus Eka.lk</h1>

      <p className="mt-2 text-gray-600">
        Smart Bus Tracking System
      </p>

      <Link
        href="/login"
        className="mt-5 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Get Started
      </Link>
    </div>
  );
}
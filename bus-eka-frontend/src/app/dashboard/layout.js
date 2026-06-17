import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-slate-100 p-8">
        {children}
      </main>
    </div>
  );
}
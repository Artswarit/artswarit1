
import React from "react";
import Navbar from "@/components/Navbar";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-2 md:px-0 pt-20 pb-10">
        <AdminDashboard />
      </div>
    </>
  );
}


import React from "react";
import Navbar from "@/components/Navbar";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 pt-28 sm:pt-32 lg:pt-36">
        <AdminDashboard />
      </div>
    </div>
  );
}

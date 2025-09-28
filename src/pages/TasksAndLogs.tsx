import React from 'react';
import Navbar from '@/components/Navbar';
import { TaskDashboard } from '@/components/dashboard/TaskDashboard';

export default function TasksAndLogsPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 pb-10">
        <TaskDashboard />
      </div>
    </>
  );
}
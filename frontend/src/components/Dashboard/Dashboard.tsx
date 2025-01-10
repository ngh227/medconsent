// src/components/Dashboard/Dashboard.tsx
// MAIN DASHBOARD

import React, {useState} from "react";
import { Link } from 'react-router-dom';
import MetricsCard from "./MetricsCard";
import RecentAgreements from "./RecentAgreements";

const Dashboard = () => {
    // MOCK DATA, WILL BE REPLACED WITH REAL API SOON
    const metrics = {
        total: 156,
        pending: 23,
        completed: 128,
        delayed: 5
    };

    const recentAgreements = [
        {
            id: '1',
            recipientName: 'John Doe',
            status: 'Pending',
            sentDate: '2024-01-09'
        },
        {
            id: '2',
            recipientName: 'Jane Smith',
            status: 'Completed',
            sentDate: '2024-01-08'
          }
    ];

    return (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard title="Total Agreements" value={metrics.total} />
            <MetricsCard title="Pending" value={metrics.pending} color="blue" />
            <MetricsCard title="Completed" value={metrics.completed} color="green" />
            <MetricsCard title="Delayed" value={metrics.delayed} color="red" />
          </div>
    
          {/* Recent Agreements */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Agreements</h2>
              <Link to="/send" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                New Agreement
              </Link>
            </div>
            <RecentAgreements agreements={recentAgreements} />
          </div>
        </div>
      );
};
    
export default Dashboard;
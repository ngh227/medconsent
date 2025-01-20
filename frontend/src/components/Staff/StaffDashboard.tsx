// src/components/Staff/StaffDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MetricsCard from './MetricsCard';
import RecentAgreements from './RecentAgreements';

interface DashboardData {
  totalPatients: number;
  totalConsents: number;
  recentConsents: Array<{
    _id: string;
    patientId: {
      name: string;
      email: string;
    };
    status: string;
    department: string;
    sentAt: string;
  }>;
  consentsByStatus: Array<{
    _id: string;
    count: number;
  }>;
}

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get<DashboardData>('/api/staff/dashboard');
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (!dashboardData) return null;

  const metrics = [
    {
      title: "Total Patients",
      value: dashboardData.totalPatients,
      color: "blue" as const
    },
    {
      title: "Total Consents",
      value: dashboardData.totalConsents,
      color: "green" as const
    },
    {
      title: "Pending",
      value: dashboardData.consentsByStatus.find(s => s._id === 'sent')?.count || 0,
      color: "yellow" as const
    },
    {
      title: "Completed",
      value: dashboardData.consentsByStatus.find(s => s._id === 'signed')?.count || 0,
      color: "green" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
        <button
          onClick={() => navigate('/staff/send')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          New Agreement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricsCard
            key={index}
            title={metric.title}
            value={metric.value}
            color={metric.color}
          />
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Agreements</h2>
        </div>
        <RecentAgreements agreements={dashboardData.recentConsents} />
      </div>
    </div>
  );
};

export default StaffDashboard;
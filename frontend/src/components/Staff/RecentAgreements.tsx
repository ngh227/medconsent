// src/components/Staff/RecentAgreements.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface Agreement {
  _id: string;
  patientId: {
    name: string;
    email: string;
  };
  status: string;
  department: string;
  sentAt: string;
}

interface RecentAgreementsProps {
  agreements: Agreement[];
}

const RecentAgreements = ({ agreements }: RecentAgreementsProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (agreements.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No recent agreements found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sent Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {agreements.map((agreement) => (
            <tr key={agreement._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">
                    {agreement.patientId.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {agreement.patientId.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(agreement.status)}`}>
                  {agreement.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {agreement.department}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(agreement.sentAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => navigate(`/staff/consents/${agreement._id}/status`)}
                  className="text-blue-600 hover:text-blue-900 font-medium"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentAgreements;
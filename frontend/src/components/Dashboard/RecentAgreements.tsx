// src/components/Dashboard/RecentAgreements.tsx

import React from "react";
import { Link } from "react-router-dom";

interface Agreement {
    id: string;
    recipientName: string;
    status: string;
    sentDate: string;
}

interface RecentAgreementsProps {
    agreements: Agreement[];
}

const RecentAgreements = ({ agreements }: RecentAgreementsProps) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'pending':
          return 'bg-blue-100 text-blue-800';
        case 'delayed':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
  
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agreements.map((agreement) => (
              <tr key={agreement.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {agreement.recipientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(agreement.status)}`}>
                    {agreement.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(agreement.sentDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link 
                    to={`/status?id=${agreement.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
};

export default RecentAgreements;
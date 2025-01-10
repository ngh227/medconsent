import React from "react";

interface MetricsCardProps {
    title: string;
    value: number;
    color?: 'blue' | 'green' | 'red';
}

const MetricsCard = ({ title, value, color = 'blue' }: MetricsCardProps) => {
    const colorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-600'
    };

    return  (
        <div className="bg-white rounded-lg shadow p-6"> 
            <h3 className="text-grey-500 text-sm font-medium">{title}</h3>
            <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
        </div>
    );
};

export default MetricsCard;
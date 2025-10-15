
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => (
  <div className="bg-base-200 shadow-lg rounded-xl p-4 sm:p-6 h-full flex flex-col">
    <h3 className="text-lg font-semibold text-gray-200 mb-4">{title}</h3>
    <div className="flex-grow">{children}</div>
  </div>
);

interface KpiCardProps {
    title: string;
    value: string;
    unit: string;
    description: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, unit, description }) => (
    <div className="bg-base-200 shadow-lg rounded-xl p-6">
        <p className="text-sm text-gray-400">{title}</p>
        <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-4xl font-bold text-primary">{value}</span>
            <span className="text-lg text-gray-300">{unit}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
);

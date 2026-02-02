'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
};

export default function StatCard({
  title,
  value,
  icon,
  color = 'blue',
}: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="mt-1 text-2xl font-bold text-gray-900">
          {value}
        </h2>
      </div>

      <div
        className={flex h-12 w-12 items-center justify-center rounded-full ${colorMap[color]}}
      >
        {icon}
      </div>
    </div>
  );
}
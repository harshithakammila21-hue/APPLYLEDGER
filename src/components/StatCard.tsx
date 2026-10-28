import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  color: 'brand' | 'blue' | 'green' | 'amber' | 'red';
  onClick?: () => void;
}

const colorMap: Record<StatCardProps['color'], string> = {
  brand: 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300',
  blue:  'bg-blue-50  dark:bg-blue-900/20  text-blue-600  dark:text-blue-300',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300',
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300',
  red:   'bg-red-50   dark:bg-red-900/20   text-red-600   dark:text-red-300',
};

export default function StatCard({ label, value, color, onClick }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-4 ${colorMap[color]} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80 leading-snug">{label}</p>
    </div>
  );
}

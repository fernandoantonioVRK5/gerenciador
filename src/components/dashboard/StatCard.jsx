// src/components/dashboard/StatCard.jsx

import React from 'react';

// Objeto para mapear a prop 'variant' para as classes de cor do Tailwind
const colorVariants = {
  green: {
    iconContainer: 'bg-emerald-900/50',
    icon: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  red: {
    iconContainer: 'bg-rose-900/50',
    icon: 'text-rose-400',
    border: 'border-rose-500/30',
  },
  blue: {
    iconContainer: 'bg-sky-900/50',
    icon: 'text-sky-400',
    border: 'border-sky-500/30',
  },
};

export function StatCard({ title, value, Icon, variant = 'blue' }) {
  const colors = colorVariants[variant] || colorVariants.blue;

  return (
    <div className={`flex flex-col gap-4 rounded-full-md border p-6 ${colors.border} bg-zinc-900/30`}>
      <header className="flex items-start justify-between">
        <span className="text-zinc-400">{title}</span>
        <div className={`p-2 rounded-md ${colors.iconContainer}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </header>
      <h2 className="text-4xl font-bold tracking-tight">{value}</h2>
    </div>
  );
}
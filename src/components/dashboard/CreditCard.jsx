// src/components/dashboard/CreditCard.jsx

import React from 'react';
import { Cpu, Wifi } from 'lucide-react';

// Objeto de variantes para estilizar cada cartão de forma diferente
const variants = {
  nubank: {
    bg: 'bg-gradient-to-tr from-purple- to-purple-900',
    logo: <h3 className="text-2xl font-bold text-white">Nubank</h3>,
  },
  inter: {
    bg: 'bg-gradient-to-tr from-orange-500 to-orange-600',
    logo: <h3 className="text-2xl font-bold text-white">Inter</h3>,
  }
};

export function CreditCard({ bank, cardHolder, lastFourDigits, balance }) {
  const variant = variants[bank] || variants.nubank;

  const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className={`relative flex flex-col justify-between w-full h-56 p-6 rounded-xl shadow-lg text-white ${variant.bg}`}>
      {/* Header do Cartão */}
      <div className="flex justify-between items-center">
        {variant.logo}
        <Wifi className="w-6 h-6" />
      </div>

      {/* Chip e Número */}
      <div className="flex items-center gap-4">
        <Cpu className="w-10 h-10 text-zinc-300/80" />
        <span className="text-xl font-mono tracking-widest">
          •••• •••• •••• {lastFourDigits}
        </span>
      </div>

      {/* Nome e Saldo */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-zinc-300">Titular</p>
          <p className="font-medium uppercase">{cardHolder}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-300">Fatura Atual</p>
          <p className="text-lg font-semibold">{formatCurrency(balance)}</p>
        </div>
      </div>
    </div>
  );
}
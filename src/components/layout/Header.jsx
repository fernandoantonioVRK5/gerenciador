// src/components/layout/Header.jsx

import React from 'react';
import { Menu } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { format, parseISO } from 'date-fns';

export function Header({ onMenuClick }) {
  // Pega a data e a função de atualização direto do contexto
  const { selectedDate, setSelectedDate } = useData();

  // 1. Converte o objeto de Data do nosso contexto para o formato 'YYYY-MM-DD' que o input exige.
  const dateValue = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  // 2. Função chamada quando o valor do input muda.
  function handleDateChange(event) {
    const dateString = event.target.value;
    if (dateString) {
      // Converte a string 'YYYY-MM-DD' de volta para um objeto de Data.
      // Usamos parseISO para interpretar corretamente a data sem problemas de fuso horário.
      const newDate = parseISO(dateString);
      setSelectedDate(newDate);
    }
  }

  return (
    <header className="grid grid-cols-3 items-center p-4 border-b border-zinc-700/80 bg-gradient-to-r from-zinc-900/80 to-zinc-950/70 backdrop-blur-lg sticky top-0 z-10">
      <div className="flex justify-start">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div />

      {/* 3. Substituímos o botão e o popover pelo input nativo */}
      <div className="flex justify-end">
        <input
          type="date"
          value={dateValue}
          onChange={handleDateChange}
          className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500
                     color-scheme-dark" // Ajuda a estilizar o ícone do calendário em navegadores compatíveis
        />
      </div>
    </header>
  );
}
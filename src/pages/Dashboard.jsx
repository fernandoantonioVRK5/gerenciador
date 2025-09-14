// src/pages/Dashboard.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; // 1. Importa o Outlet
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '../contexts/DataContext';

export function Dashboard() {
  const { selectedDate } = useData();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  // 2. Remove o estado 'activeTab', pois a URL agora controla isso

  const displayMonth = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedDisplayMonth = displayMonth.charAt(0).toUpperCase() + displayMonth.slice(1);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* O Sidebar não precisa mais controlar a aba, só o fechamento */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-8 flex-1">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-200 mb-8">
            Visão Geral de {capitalizedDisplayMonth}
          </h2>

          <div>
            {/* 3. O Outlet renderiza a aba correta (GeneralTab ou BanksTab) com base na URL */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
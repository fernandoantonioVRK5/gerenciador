// src/components/layout/Sidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // 1. Usa Link e useLocation
import { X, LayoutDashboard, Landmark, Settings } from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation(); // 2. Hook para saber a URL atual

  // Função para fechar o sidebar após o clique, dando tempo para a navegação
  const handleNavigate = () => {
    setTimeout(() => {
      onClose();
    }, 150);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 text-zinc-50 z-30 p-6 shadow-xl
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'}`}
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav>
          <ul className="space-y-2">
            {/* 3. Troca os botões por Links de Navegação */}
            <li>
              <Link
                to="/"
                onClick={handleNavigate}
                // 4. Estilo dinâmico com base na URL atual
                className={`w-full flex items-center gap-3 p-3 rounded-md text-left ${
                  location.pathname === '/' ? 'bg-zinc-800' : 'hover:bg-zinc-800'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Visão Geral</span>
              </Link>
            </li>
            <li>
              <Link
                to="/banks"
                onClick={handleNavigate}
                className={`w-full flex items-center gap-3 p-3 rounded-md text-left ${
                  location.pathname === '/banks' ? 'bg-zinc-800' : 'hover:bg-zinc-800'
                }`}
              >
                <Landmark className="w-5 h-5" />
                <span>Bancos</span>
              </Link>
            </li>
            {/* ... outros links */}
          </ul>
        </nav>
      </aside>
    </>
  );
}
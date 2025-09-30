// src/components/layout/Sidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// O ícone 'Settings' já estava importado, o que é ótimo!
import { X, LayoutDashboard, Landmark, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { logout } = useAuth();

  const handleNavigate = () => {
    setTimeout(() => {
      onClose();
    }, 150);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
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
                    transition-transform duration-300 ease-in-out flex flex-col
                    ${isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'}`}
      >
        <div>
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={onClose} className="text-zinc-400 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
            </div>
            <nav>
            <ul className="space-y-2">
                <li>
                  <Link
                      to="/"
                      onClick={handleNavigate}
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
                {/* --- NOVO LINK DE CONFIGURAÇÕES --- */}
                <li>
                  <Link
                      to="/settings"
                      onClick={handleNavigate}
                      className={`w-full flex items-center gap-3 p-3 rounded-md text-left ${
                      location.pathname === '/settings' ? 'bg-zinc-800' : 'hover:bg-zinc-800'
                      }`}
                  >
                      <Settings className="w-5 h-5" />
                      <span>Configurações</span>
                  </Link>
                </li>
            </ul>
            </nav>
        </div>
        
        <div className="mt-auto">
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-md text-left text-red-400 hover:bg-red-900/50 hover:text-red-300"
            >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
            </button>
        </div>
      </aside>
    </>
  );
}
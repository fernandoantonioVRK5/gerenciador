// src/pages/SettingsPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react'; // Importa o ícone de seta para a esquerda

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword, user } = useAuth();
  const navigate = useNavigate(); // Hook para navegação

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setIsLoading(true);
      await updatePassword(newPassword);
      setSuccess('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao alterar a senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Ajuste para ocupar a largura total e altura mínima
    <div className="flex flex-col min-h-screen p-4 sm:p-6 md:p-8 bg-zinc-950 text-zinc-100">
      
      {/* Botão de Voltar */}
      <button
        onClick={() => navigate(-1)} // Volta para a página anterior no histórico
        className="self-start flex items-center gap-2 text-zinc-400 hover:text-cyan-500 mb-6 p-2 rounded-md hover:bg-zinc-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <div className="flex-grow flex flex-col items-center"> {/* Centraliza verticalmente e horizontalmente */}
        <h1 className="text-3xl font-bold mb-6 text-center">Configurações da Conta</h1>

        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-2xl">
          <h2 className="text-xl font-semibold mb-2">Alterar Senha</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Você está alterando a senha para a conta: <strong>{user?.email}</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-300">Nova Senha</label>
              <input type="password" id="newPassword" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">Confirme a Nova Senha</label>
              <input type="password" id="confirmPassword" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-green-400">{success}</p>}

            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-zinc-600 transition-colors"
            >
              {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
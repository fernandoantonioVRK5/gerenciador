// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  // --- Estados ---
  const [isSignUp, setIsSignUp] = useState(false); // Novo estado para alternar modo
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(''); // Novo estado para mensagens de sucesso
  const [isLoading, setIsLoading] = useState(false);

  const { login, signUp } = useAuth(); // Pegamos a nova função signUp
  const navigate = useNavigate();

  // --- Funções ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage('');

    if (!email || !password) {
      setError('Por favor, preencha o email e a senha.');
      return;
    }

    try {
      setIsLoading(true);
      if (isSignUp) {
        // Modo de Cadastro
        await signUp(email, password);
        setMessage('Cadastro realizado! Verifique seu email para confirmar a conta.');
      } else {
        // Modo de Login
        await login(email, password);
        navigate('/'); // Redireciona apenas no login
      }
    } catch (err) {
      setError(err.message || `Falha ao ${isSignUp ? 'cadastrar' : 'fazer login'}.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setMessage('');
  }

  // --- Renderização (JSX) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            {isSignUp ? (
              <UserPlus className="mx-auto h-12 w-12 text-cyan-500" />
            ) : (
              <LogIn className="mx-auto h-12 w-12 text-cyan-500" />
            )}
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-100">
                {isSignUp ? 'Crie sua conta' : 'Acesse sua conta'}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
                {isSignUp ? 'É rápido e fácil.' : 'Bem-vindo de volta!'}
            </p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6 bg-zinc-900/80 border border-zinc-800 p-8 rounded-lg shadow-2xl shadow-zinc-950/50"
        >
          {/* ... campos de email e senha (sem alteração) ... */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">Email</label>
            <div className="mt-1">
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="voce@exemplo.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">Senha</label>
            <div className="mt-1">
              <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-md text-sm">
              <p>{error}</p>
            </div>
          )}
          
          {/* Mensagem de Sucesso (para o cadastro) */}
          {message && (
             <div className="bg-green-900/50 border border-green-800 text-green-300 px-4 py-3 rounded-md text-sm">
              <p>{message}</p>
            </div>
          )}

          {/* Botão de Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-cyan-500 disabled:bg-zinc-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Aguarde...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
            </button>
          </div>
        </form>

        {/* Botão para alternar entre os modos */}
        <div className="text-center mt-6">
            <button onClick={toggleMode} className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline">
                {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Cadastre-se'}
            </button>
        </div>

      </div>
    </div>
  );
}
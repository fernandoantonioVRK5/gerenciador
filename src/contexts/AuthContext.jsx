// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient'; // Nosso cliente Supabase

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor (AuthProvider)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect para gerenciar a sessão do usuário
  useEffect(() => {
    // Tenta pegar a sessão ativa quando o componente monta
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Ouve mudanças no estado de autenticação (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Limpeza: cancela a inscrição ao desmontar o componente
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Função para fazer login
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error; // Lança o erro para ser pego no componente de Login
  };

  // Função para fazer logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Função para cadastrar novo usuário com nickname
  const signUp = async (email, password, nickname) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Passamos o nickname dentro de options.data para o trigger do Supabase
      options: {
        data: {
          nickname: nickname,
        }
      }
    });
    if (error) throw error;
    return data;
  };

  // Função para atualizar a senha do usuário logado
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  };

  // 3. Define os valores que o contexto vai prover
  const value = {
    session,
    user: session?.user, // Facilita o acesso aos dados do usuário
    login,
    logout,
    signUp,
    updatePassword,
  };

  // Retorna o Provedor envolvendo os componentes filhos
  // Só renderiza os filhos depois que o carregamento inicial da sessão terminar
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 4. Cria um hook customizado para usar o contexto facilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
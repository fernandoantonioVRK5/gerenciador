// src/components/auth/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute() {
  const { session } = useAuth();

  // 1. Verifica se existe uma sessão ativa.
  if (!session) {
    // 2. Se não houver, redireciona o usuário para a página de login.
    // O 'replace' evita que o usuário possa voltar para a página anterior (que exigia login) no histórico do navegador.
    return <Navigate to="/login" replace />;
  }

  // 3. Se houver uma sessão, renderiza o conteúdo da rota filha.
  // O <Outlet /> é um placeholder para os componentes das rotas aninhadas (Dashboard, CardDetail, etc.)
  return <Outlet />;
}
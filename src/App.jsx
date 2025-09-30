// src/App.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

function App() {
  // Agora o App.jsx é responsável por prover os contextos para toda a aplicação.
  // O <Outlet /> renderizará a rota correspondente (LoginPage ou as rotas protegidas)
  // já com acesso a todos os dados e ao estado de autenticação.
  return (
    <AuthProvider>
      <DataProvider>
        <Outlet />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
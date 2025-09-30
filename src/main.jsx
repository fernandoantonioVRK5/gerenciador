// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

// Componentes e Páginas
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import CardDetailPage from './pages/CardDetailPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';
import { GeneralTab } from './components/tabs/GeneralTab.jsx';
import { BanksTab } from './components/tabs/BanksTab.jsx';

// Registra o Service Worker gerenciado pelo vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onNeedRefresh() {
    // opcional: exiba um toast/botão; simples: recarrega para aplicar a nova versão
    // window.location.reload();
  },
  onOfflineReady() {
    // opcional: notifique o usuário que o app está pronto para uso offline
    // console.log('App pronto para uso offline');
  },
});

// Configuração do roteador com rotas públicas e privadas
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App.jsx é a raiz, provendo os contextos para toda a aplicação
    children: [
      // Rota Pública (não precisa de login)
      {
        path: '/login',
        element: <LoginPage />,
      },

      // Grupo de Rotas Protegidas
      {
        element: <ProtectedRoute />, // "Segurança" que verifica se o usuário está logado
        children: [
          // Todas as rotas aqui dentro exigem autenticação
          {
            path: '/',
            element: <Dashboard />,
            children: [
              { index: true, element: <GeneralTab /> },
              { path: 'banks', element: <BanksTab /> },
            ],
          },
          {
            path: 'card/:cardId',
            element: <CardDetailPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);

// Renderiza a aplicação. Os Providers (contextos) já estão dentro do App.jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
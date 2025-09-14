// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import CardDetailPage from './pages/CardDetailPage.jsx';
import { DataProvider } from './contexts/DataContext.jsx';
import { GeneralTab } from './components/tabs/GeneralTab.jsx';
import { BanksTab } from './components/tabs/BanksTab.jsx';
import './index.css';

// 👉 registra o Service Worker gerenciado pelo vite-plugin-pwa
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

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
        children: [
          { index: true, element: <GeneralTab /> },
          { path: 'banks', element: <BanksTab /> },
        ],
      },
      { path: 'card/:cardId', element: <CardDetailPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataProvider>
      <RouterProvider router={router} />
    </DataProvider>
  </React.StrictMode>,
);

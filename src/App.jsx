// src/App.jsx

import { Outlet } from 'react-router-dom';

function App() {
  // O Outlet é um placeholder que renderiza a rota filha correspondente
  // (ou o Dashboard, ou a CardDetailPage)
  return <Outlet />;
}

export default App;
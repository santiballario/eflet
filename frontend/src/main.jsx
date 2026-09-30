import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '@/auth/auth-context';
import './index.css';
import App from './App.jsx';

// BrowserRouter: habilita las rutas (URL <-> pagina).
// AuthProvider: comparte el usuario logueado con toda la app (Context API).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

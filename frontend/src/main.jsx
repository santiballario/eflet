import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '@/auth/auth-context';
import { ConfirmarProvider } from '@/components/ui/ConfirmarProvider';
import { AvisosProvider } from '@/components/ui/AvisosProvider';
import './index.css';
import App from './App.jsx';

// BrowserRouter: habilita las rutas (URL <-> pagina).
// AuthProvider: comparte el usuario logueado con toda la app (Context API).
// ConfirmarProvider: el cartel de "¿Seguro que...?" que usan todas las pantallas.
// AvisosProvider: los avisos flotantes ("Vehículo guardado.").
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ConfirmarProvider>
          <AvisosProvider>
            <App />
          </AvisosProvider>
        </ConfirmarProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

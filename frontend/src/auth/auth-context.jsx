import { createContext, useCallback, useEffect, useState } from 'react';
import * as authService from '@/services/auth';
import { onSessionExpired } from '@/lib/session-events';
import { clearToken, getToken, setToken } from '@/lib/token-storage';

// status: 'loading' (todavia no sabemos si hay sesion) | 'authenticated' | 'anonymous'
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(getToken() ? 'loading' : 'anonymous');
  const [usuario, setUsuario] = useState(null);

  const cerrarSesion = useCallback(() => {
    clearToken();
    setUsuario(null);
    setStatus('anonymous');
  }, []);

  useEffect(() => {
    // Al montar (por ejemplo despues de un F5) puede haber un token guardado.
    // GET /auth/me confirma que sigue siendo valido y nos dice el rol.
    if (!getToken()) return;
    let cancelado = false;

    authService
      .getMe()
      .then((usuario) => {
        if (cancelado) return;
        setUsuario(usuario);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!cancelado) cerrarSesion();
      });

    return () => {
      cancelado = true;
    };
  }, [cerrarSesion]);

  // api-client.js avisa cuando el backend responde 401 (token vencido).
  useEffect(() => onSessionExpired(cerrarSesion), [cerrarSesion]);

  const login = useCallback(async (email, password) => {
    const { token, usuario } = await authService.login({ email, password });
    setToken(token);
    setUsuario(usuario);
    setStatus('authenticated');
    return usuario;
  }, []);

  return (
    <AuthContext.Provider value={{ status, usuario, login, logout: cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

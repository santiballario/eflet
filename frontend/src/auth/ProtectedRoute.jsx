import { Navigate, useLocation } from 'react-router';
import { useAuth } from './use-auth';
import { inicioSegunRol } from './roles';
import { Cargando } from '@/components/ui/Cargando';

// Envuelve las rutas privadas. `roles` (opcional) limita a ciertos roles.
// OJO: esto es solo comodidad para el usuario. La seguridad real esta en el
// backend (requireAuth + requireRole): aunque alguien saltee esta pantalla,
// la API le responde 401/403.
export function ProtectedRoute({ children, roles }) {
  const { status, usuario } = useAuth();
  const location = useLocation();

  // Todavia no respondio /auth/me: si redirigieramos ahora, cada F5 mandaria
  // a /login un instante aunque la sesion sea valida.
  if (status === 'loading') return <Cargando />;

  if (status === 'anonymous') {
    // Guardamos de donde venia para volver ahi despues del login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={inicioSegunRol(usuario.rol)} replace />;
  }

  return children;
}

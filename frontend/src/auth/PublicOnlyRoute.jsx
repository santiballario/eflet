import { Navigate } from 'react-router';
import { useAuth } from './use-auth';
import { inicioSegunRol } from './roles';
import { PantallaCarga } from '@/components/ui/PantallaCarga';

// Para /login: si ya hay sesion, no tiene sentido mostrarlo de nuevo.
export function PublicOnlyRoute({ children }) {
  const { status, usuario } = useAuth();

  if (status === 'loading') return <PantallaCarga />;
  if (status === 'authenticated') return <Navigate to={inicioSegunRol(usuario.rol)} replace />;

  return children;
}

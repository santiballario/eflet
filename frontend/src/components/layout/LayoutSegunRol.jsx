import { useAuth } from '@/auth/use-auth';
import { ROL } from '@/auth/roles';
import { AdminLayout } from './AdminLayout';
import { ConductorLayout } from './ConductorLayout';

// Para las pantallas que usan los dos roles (ej: Mi cuenta): cada uno la ve
// dentro de su propio layout, con su menu de siempre.
export function LayoutSegunRol() {
  const { usuario } = useAuth();
  return usuario.rol === ROL.CONDUCTOR ? <ConductorLayout /> : <AdminLayout />;
}

import { Link, Outlet } from 'react-router';
import { CircleUser, LogOut } from 'lucide-react';
import { useAuth } from '@/auth/use-auth';

// Vista del conductor: pensada para usar desde el celular arriba del vehiculo,
// sin menu lateral, con botones grandes.
export function ConductorLayout() {
  const { logout } = useAuth();

  return (
    <>
      <header className="conductor-header">
        <Link to="/mis-viajes" className="marca" style={{ color: 'inherit', textDecoration: 'none' }}>
          EFLET
        </Link>
        <div className="acciones">
          <Link to="/mi-cuenta" className="btn btn-secundario btn-chico">
            <CircleUser size={16} aria-hidden="true" />
            Mi cuenta
          </Link>
          <button className="nav-link" onClick={(e) => {
            e.preventDefault();
            const confirmar = window.confirm("¿Seguro que desea salir?");
            if (confirmar) {
              logout();
            }
          }}>
            <LogOut size={18} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="conductor-main">
        <Outlet />
      </main>
    </>
  );
}

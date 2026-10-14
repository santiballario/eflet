import { Link, Outlet } from 'react-router';
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
            Mi cuenta
          </Link>
          <button className="btn btn-secundario btn-chico" onClick={logout}>
            Salir
          </button>
        </div>
      </header>
      <main className="conductor-main">
        <Outlet />
      </main>
    </>
  );
}

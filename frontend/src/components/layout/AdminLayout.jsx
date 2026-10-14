import { NavLink, Outlet } from 'react-router';
import { useAuth } from '@/auth/use-auth';

// Menu lateral del documento de diseno: Panel de Control, Hojas de Ruta,
// Gestion de Flota y Conductores. En celular se muestra abajo (bottom nav).
const MENU = [
  { to: '/', texto: 'Panel de Control', icono: '📊', end: true },
  { to: '/viajes', texto: 'Hojas de Ruta', icono: '🗺️' },
  { to: '/vehiculos', texto: 'Gestión de Flota', icono: '🚚' },
  { to: '/conductores', texto: 'Conductores', icono: '👤' },
];

function Links() {
  // NavLink agrega la clase "active" sola cuando la URL coincide.
  // `end` hace que "/" no quede activo en todas las paginas.
  return MENU.map((item) => (
    <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
      <span aria-hidden="true">{item.icono}</span>
      {item.texto}
    </NavLink>
  ));
}

export function AdminLayout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="marca">EFLET</div>
        <nav>
          <Links />
        </nav>
        <div className="usuario">
          <div>{usuario.email ?? usuario.rol}</div>
          <NavLink to="/mi-cuenta" className="nav-link">
            Mi cuenta
          </NavLink>
          <button className="nav-link" onClick={logout}>
            ↩ Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Outlet = aca se dibuja la pagina hija que coincide con la URL */}
      <main className="contenido">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <Links />
        <button className="nav-link" onClick={logout}>
          <span aria-hidden="true">↩</span>
          Salir
        </button>
      </nav>
    </div>
  );
}

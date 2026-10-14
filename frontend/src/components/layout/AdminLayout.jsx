import { NavLink, Outlet } from 'react-router';
import { CircleUser, LayoutDashboard, LogOut, Route, Truck, Users } from 'lucide-react';
import { useAuth } from '@/auth/use-auth';

// Menu lateral del documento de diseno: Panel de Control, Hojas de Ruta,
// Gestion de Flota y Conductores. En celular se muestra abajo (bottom nav).
// Los iconos son de lucide-react (SVG): se ven igual en todos los sistemas,
// a diferencia de los emojis, y toman el color del texto.
const MENU = [
  { to: '/', texto: 'Panel de Control', Icono: LayoutDashboard, end: true },
  { to: '/viajes', texto: 'Hojas de Ruta', Icono: Route },
  { to: '/vehiculos', texto: 'Gestión de Flota', Icono: Truck },
  { to: '/conductores', texto: 'Conductores', Icono: Users },
];

function Links() {
  // NavLink agrega la clase "active" sola cuando la URL coincide.
  // `end` hace que "/" no quede activo en todas las paginas.
  return MENU.map(({ to, texto, Icono, end }) => (
    <NavLink key={to} to={to} end={end} className="nav-link">
      <Icono size={18} aria-hidden="true" />
      {texto}
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
            <CircleUser size={18} aria-hidden="true" />
            Mi cuenta
          </NavLink>
          <button className="nav-link" onClick={logout}>
            <LogOut size={18} aria-hidden="true" />
            Cerrar sesión
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
          <LogOut size={18} aria-hidden="true" />
          Salir
        </button>
      </nav>
    </div>
  );
}

import { NavLink, Outlet } from 'react-router';
import { CircleUser, LayoutDashboard, LogOut, Route, Truck, Users } from 'lucide-react';
import { useAuth } from '@/auth/use-auth';
import { useConfirmar } from '@/components/ui/confirmar-context';
import { nombreCompleto } from '@/utils/formato';
import { Avatar } from '@/components/ui/Avatar';

// Menu lateral del documento de diseno: Panel de Control, Hojas de Ruta,
// Gestion de Flota y Conductores. En celular se muestra abajo (bottom nav)
// con textos cortos, como en el mockup mobile.
// Los iconos son de lucide-react (SVG): se ven igual en todos los sistemas,
// a diferencia de los emojis, y toman el color del texto.
const MENU = [
  { to: '/', texto: 'Panel de Control', corto: 'Panel', Icono: LayoutDashboard, end: true },
  { to: '/viajes', texto: 'Hojas de Ruta', corto: 'Viajes', Icono: Route },
  { to: '/vehiculos', texto: 'Gestión de Flota', corto: 'Flota', Icono: Truck },
  { to: '/conductores', texto: 'Conductores', corto: 'Conductores', Icono: Users },
];

export function AdminLayout() {
  const { usuario, logout } = useAuth();
  const confirmar = useConfirmar();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="marca">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          EFLET
        </div>
        <div className="seccion-menu">Gestión</div>
        <nav>
          {/* NavLink agrega la clase "active" sola cuando la URL coincide.
              `end` hace que "/" no quede activo en todas las paginas. */}
          {MENU.map(({ to, texto, Icono, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link" title={texto}>
              <Icono size={18} aria-hidden="true" />
              {texto}
            </NavLink>
          ))}
        </nav>
        <div className="usuario">
          <div className="persona">
            <Avatar nombre={usuario.nombre} apellido={usuario.apellido} />
            <div>
              <div className="usuario-nombre">{nombreCompleto(usuario) || usuario.rol}</div>
              <div className="chico">{usuario.rol}</div>
            </div>
          </div>
          <NavLink to="/mi-cuenta" className="nav-link" title="Mi cuenta">
            <CircleUser size={18} aria-hidden="true" />
            Mi cuenta
          </NavLink>
          <button
            className="nav-link"
            title="Cerrar sesión"
            onClick={async () => {
              if (await confirmar({ titulo: '¿Cerrar sesión?', mensaje: 'Vas a tener que volver a ingresar con tu email y contraseña.', textoConfirmar: 'Cerrar sesión' })) logout();
            }}
          >
            <LogOut size={18} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Outlet = aca se dibuja la pagina hija que coincide con la URL */}
      <main className="contenido">
        <Outlet />
      </main>

      {/* En celular: las 4 secciones + Mi cuenta (cerrar sesion esta dentro de Mi cuenta) */}
      <nav className="bottom-nav" aria-label="Menú principal">
        {MENU.map(({ to, corto, Icono, end }) => (
          <NavLink key={to} to={to} end={end} className="nav-link">
            <Icono size={20} aria-hidden="true" />
            {corto}
          </NavLink>
        ))}
        <NavLink to="/mi-cuenta" className="nav-link">
          <CircleUser size={20} aria-hidden="true" />
          Cuenta
        </NavLink>
      </nav>
    </div>
  );
}

import { Link, Outlet } from 'react-router';
import { CircleUser, LogOut } from 'lucide-react';
import { useAuth } from '@/auth/use-auth';
import { useConfirmar } from '@/components/ui/confirmar-context';

// Vista del conductor: pensada para usar desde el celular arriba del vehiculo,
// sin menu lateral, con botones grandes.
export function ConductorLayout() {
  const { logout } = useAuth();
  const confirmar = useConfirmar();

  return (
    <>
      <header className="conductor-header">
        {/* El contenido del encabezado tiene el mismo ancho maximo que la pagina,
            asi en la compu el logo y los botones quedan alineados con lo de abajo */}
        <div className="conductor-header-contenido">
          <Link to="/mis-viajes" className="marca">
            <img src="/favicon.svg" alt="" width="26" height="26" />
            EFLET
          </Link>
          <div className="acciones">
            <Link to="/mi-cuenta" className="btn btn-secundario btn-chico">
              <CircleUser size={16} aria-hidden="true" />
              Mi cuenta
            </Link>
            {/* Mismo estilo que "Mi cuenta": botones claros sobre el encabezado azul */}
            <button
              className="btn btn-secundario btn-chico"
              onClick={async () => {
                if (await confirmar({ titulo: '¿Cerrar sesión?', mensaje: 'Vas a tener que volver a ingresar con tu email y contraseña.', textoConfirmar: 'Cerrar sesión' })) logout();
              }}
            >
              <LogOut size={16} aria-hidden="true" />
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="conductor-main">
        <Outlet />
      </main>
    </>
  );
}

import { Inbox } from 'lucide-react';

// Mensaje para cuando una lista no tiene nada que mostrar: un icono, el texto
// y, si hace falta, una accion (por ejemplo "Limpiar filtros").
export function Vacio({ icono: Icono = Inbox, children, accion }) {
  return (
    <div className="vacio">
      <span className="vacio-icono">
        <Icono size={24} aria-hidden="true" />
      </span>
      <p>{children}</p>
      {accion}
    </div>
  );
}

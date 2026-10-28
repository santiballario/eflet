import { Link } from 'react-router';

// Tarjeta con un numero grande (Panel de Control). Todas tienen el mismo
// estilo; `alerta` pinta el numero de ambar cuando hay algo que revisar.
// Si recibe `to`, la tarjeta entera es un link a esa pantalla.
// `icono`: un icono de lucide-react que se muestra en un circulo de color suave.
export function StatCard({ titulo, valor, detalle, alerta = false, to, icono: Icono }) {
  const contenido = (
    <>
      {Icono && (
        <span className="stat-icono">
          <Icono size={20} aria-hidden="true" />
        </span>
      )}
      <div className="titulo">{titulo}</div>
      <div className="valor">{valor}</div>
      {detalle && <div className="detalle">{detalle}</div>}
    </>
  );
  const clase = `stat${alerta ? ' alerta' : ''}`;

  return to ? (
    <Link to={to} className={clase}>
      {contenido}
    </Link>
  ) : (
    <div className={clase}>{contenido}</div>
  );
}

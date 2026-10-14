import { Link } from 'react-router';

// Tarjeta con un numero grande (Panel de Control). Todas tienen el mismo
// estilo; `alerta` pinta el numero de rojo cuando hay algo que revisar.
// Si recibe `to`, la tarjeta entera es un link a esa pantalla.
export function StatCard({ titulo, valor, detalle, alerta = false, to }) {
  const contenido = (
    <>
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

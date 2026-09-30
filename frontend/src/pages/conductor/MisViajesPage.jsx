import { Link } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { listarViajes } from '@/services/viajes';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Cargando } from '@/components/ui/Cargando';
import { descripcionVehiculo, formatearFechaHora } from '@/utils/formato';

// El backend ya devuelve solo los viajes de este conductor (filtra por el token).
export function MisViajesPage() {
  const { data: viajes, error, cargando } = useFetch(() => listarViajes());

  if (cargando) return <Cargando />;
  if (error) return <Alerta>{error.message}</Alerta>;

  const pendientes = viajes.filter((v) => v.EstadoViaje.descripcion !== 'Finalizado');
  const finalizados = viajes.filter((v) => v.EstadoViaje.descripcion === 'Finalizado');

  return (
    <>
      <h1>Mis hojas de ruta</h1>

      {pendientes.length === 0 && <div className="card vacio">No tenés viajes asignados por ahora.</div>}
      {pendientes.map((v) => (
        <TarjetaViaje key={v.id} viaje={v} />
      ))}

      {finalizados.length > 0 && (
        <>
          <h2 style={{ marginTop: '1.5rem' }}>Finalizados</h2>
          {finalizados.slice(0, 5).map((v) => (
            <TarjetaViaje key={v.id} viaje={v} />
          ))}
        </>
      )}
    </>
  );
}

function TarjetaViaje({ viaje }) {
  const entregados = viaje.Destinos.filter((d) => d.estado_entrega !== 'Pendiente').length;
  return (
    <Link to={`/mis-viajes/${viaje.id}`} className="card" style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
      <div className="encabezado" style={{ marginBottom: '0.5rem' }}>
        <strong>Hoja de ruta #{viaje.id}</strong>
        <Badge estado={viaje.EstadoViaje.descripcion} />
      </div>
      <div>{descripcionVehiculo(viaje.Vehiculo)}</div>
      <div className="chico texto-suave">
        {entregados}/{viaje.Destinos.length} paradas · creada {formatearFechaHora(viaje.fecha_creacion)}
      </div>
    </Link>
  );
}

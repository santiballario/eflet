import { Link } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { listarVehiculos } from '@/services/vehiculos';
import { listarViajes } from '@/services/viajes';
import { Alerta } from '@/components/ui/Alerta';
import { Cargando } from '@/components/ui/Cargando';
import { StatCard } from '@/components/ui/StatCard';
import { TablaViajes } from '@/components/TablaViajes';
import { diasHasta, formatearFecha } from '@/utils/formato';

function esHoy(fechaIso) {
  return fechaIso && new Date(fechaIso).toDateString() === new Date().toDateString();
}

// Panel de Control del documento de diseno: encabezado con degradé, tres
// tarjetas con los numeros del dia y la tabla de viajes que no terminaron.
export function DashboardPage() {
  const vehiculos = useFetch(listarVehiculos);
  const viajes = useFetch(() => listarViajes());

  if (vehiculos.cargando || viajes.cargando) return <Cargando />;
  const error = vehiculos.error || viajes.error;
  if (error) return <Alerta>{error.message}</Alerta>;

  // Los numeros se calculan en el front a partir de las listas que ya trae la API.
  const activos = vehiculos.data.filter((v) => v.estado === 'Activo').length;
  const vtvProximas = vehiculos.data.filter((v) => v.estado !== 'Baja' && diasHasta(v.vencimiento_vtv) <= 30);
  const destinosDeHoy = viajes.data.filter((v) => esHoy(v.fecha_salida)).flatMap((v) => v.Destinos);
  const entregasHoy = destinosDeHoy.filter((d) => d.estado_entrega === 'Entregado').length;
  const sinFinalizar = viajes.data.filter((v) => v.EstadoViaje.descripcion !== 'Finalizado');

  return (
    <>
      <div className="bienvenida">
        <div>
          <h1>Panel de Control</h1>
          <p>Bienvenido, Administrador.</p>
        </div>
        <Link to="/viajes/nuevo" className="btn btn-claro">
          + Nuevo viaje
        </Link>
      </div>

      <div className="stats">
        <StatCard
          titulo="Vehículos activos"
          valor={`${activos} / ${vehiculos.data.length}`}
          detalle="Activos sobre el total de la flota"
          to="/vehiculos"
        />
        <StatCard
          titulo="Entregas del día"
          valor={entregasHoy}
          detalle={`De ${destinosDeHoy.length} paradas de los viajes de hoy`}
          to="/viajes"
        />
        <StatCard
          titulo="VTV próximas a vencer"
          valor={vtvProximas.length}
          detalle={vtvProximas.length ? 'Vencida o vence en 30 días' : 'Ninguna en los próximos 30 días'}
          to="/vehiculos"
        />
      </div>

      {vtvProximas.length > 0 && (
        <Alerta tipo="advertencia">
          VTV vencida o por vencer en 30 días:{' '}
          {vtvProximas.map((v) => `${v.patente} (${formatearFecha(v.vencimiento_vtv)})`).join(', ')}
        </Alerta>
      )}

      <div className="card">
        <h2>Viajes sin finalizar</h2>
        <TablaViajes viajes={sinFinalizar} />
      </div>
    </>
  );
}

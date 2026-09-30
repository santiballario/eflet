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

// Panel de Control del documento de diseno: tarjetas con los numeros del dia
// y la tabla de viajes que todavia no terminaron.
export function DashboardPage() {
  const vehiculos = useFetch(listarVehiculos);
  const viajes = useFetch(() => listarViajes());

  if (vehiculos.cargando || viajes.cargando) return <Cargando />;
  const error = vehiculos.error || viajes.error;
  if (error) return <Alerta>{error.message}</Alerta>;

  // Los numeros se calculan en el front a partir de las listas que ya trae la API.
  const activos = vehiculos.data.filter((v) => v.estado === 'Activo').length;
  const vtvProximas = vehiculos.data.filter((v) => v.estado !== 'Baja' && diasHasta(v.vencimiento_vtv) <= 30);
  const enCurso = viajes.data.filter((v) => v.EstadoViaje.descripcion === 'En Viaje').length;
  const entregasHoy = viajes.data
    .filter((v) => esHoy(v.fecha_salida))
    .flatMap((v) => v.Destinos)
    .filter((d) => d.estado_entrega === 'Entregado').length;
  const sinFinalizar = viajes.data.filter((v) => v.EstadoViaje.descripcion !== 'Finalizado');

  return (
    <>
      <div className="encabezado">
        <h1>Panel de Control</h1>
        <Link to="/viajes/nuevo" className="btn">
          + Nuevo viaje
        </Link>
      </div>

      <div className="stats">
        <StatCard titulo="Vehículos activos" valor={activos} />
        <StatCard titulo="Viajes en curso" valor={enCurso} tipo="advertencia" />
        <StatCard titulo="Entregas del día" valor={entregasHoy} tipo="exito" />
        <StatCard titulo="VTV próximas a vencer" valor={vtvProximas.length} tipo={vtvProximas.length ? 'error' : 'exito'} />
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

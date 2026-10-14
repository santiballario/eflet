import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useFetch } from '@/hooks/use-fetch';
import { listarViajes } from '@/services/viajes';
import { getMe } from '@/services/auth';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Cargando } from '@/components/ui/Cargando';
import { Progreso } from '@/components/ui/Progreso';
import { StatCard } from '@/components/ui/StatCard';
import { descripcionVehiculo, diasHasta, formatearFecha, formatearFechaHora } from '@/utils/formato';

const resueltas = (viaje) => viaje.Destinos.filter((d) => d.estado_entrega !== 'Pendiente').length;

// Pantalla de inicio del conductor (pensada para el celular):
// saludo, aviso de licencia, su viaje actual destacado, un resumen y el historial.
// El backend ya devuelve solo los viajes de este conductor (filtra por el token).
export function MisViajesPage() {
  const viajes = useFetch(() => listarViajes());
  const perfil = useFetch(getMe);
  // La fecha de hoy se calcula una sola vez al abrir la pantalla (no en cada render)
  const [hoy] = useState(() => {
    const texto = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    return texto.charAt(0).toUpperCase() + texto.slice(1); // "Miércoles, 14 de octubre"
  });

  if (viajes.cargando || perfil.cargando) return <Cargando />;
  const error = viajes.error || perfil.error;
  if (error) return <Alerta>{error.message}</Alerta>;

  const yo = perfil.data;
  const pendientes = viajes.data.filter((v) => v.EstadoViaje.descripcion !== 'Finalizado');
  const finalizados = viajes.data.filter((v) => v.EstadoViaje.descripcion === 'Finalizado');
  const [actual, ...otros] = pendientes;

  // Resumen calculado con los viajes que ya trae la API
  const entregas = finalizados.flatMap((v) => v.Destinos).filter((d) => d.estado_entrega === 'Entregado').length;
  const km = finalizados.reduce((total, v) => total + (v.km_recorridos ?? 0), 0);
  const diasLicencia = yo.conductor ? diasHasta(yo.conductor.vencimiento_licencia) : null;

  return (
    <>
      <div className="saludo">
        <h1>Hola, {yo.nombre}</h1>
        <p className="texto-suave">{hoy}</p>
      </div>

      {diasLicencia !== null && diasLicencia < 0 && (
        <Alerta>Tu licencia está vencida. Hasta que la renueves no podés salir con un viaje.</Alerta>
      )}
      {diasLicencia !== null && diasLicencia >= 0 && diasLicencia <= 30 && (
        <Alerta tipo="advertencia">
          Tu licencia vence el {formatearFecha(yo.conductor.vencimiento_licencia)} (en {diasLicencia} días).
        </Alerta>
      )}

      {actual ? (
        <ViajeActual viaje={actual} />
      ) : (
        <div className="card vacio">No tenés viajes asignados por ahora.</div>
      )}

      {otros.map((v) => (
        <TarjetaViaje key={v.id} viaje={v} />
      ))}

      <h2 className="subtitulo-seccion">Tu resumen</h2>
      <div className="stats">
        <StatCard titulo="Viajes realizados" valor={finalizados.length} />
        <StatCard titulo="Entregas hechas" valor={entregas} />
        <StatCard titulo="Km recorridos" valor={km.toLocaleString('es-AR')} />
      </div>

      {finalizados.length > 0 && (
        <>
          <h2 className="subtitulo-seccion">Últimos viajes</h2>
          {finalizados.slice(0, 5).map((v) => (
            <TarjetaViaje key={v.id} viaje={v} />
          ))}
        </>
      )}
    </>
  );
}

// El viaje que tiene que hacer ahora, bien visible y con un boton grande
function ViajeActual({ viaje }) {
  const estado = viaje.EstadoViaje.descripcion;
  const accion = {
    'En Depósito': 'Registrar salida',
    'En Viaje': 'Continuar recorrido',
    Entregado: 'Registrar regreso',
  }[estado];

  return (
    <section className="card viaje-actual">
      <div className="encabezado" style={{ marginBottom: '0.5rem' }}>
        <h2 style={{ margin: 0 }}>Tu viaje de hoy</h2>
        <Badge estado={estado} />
      </div>
      <p style={{ margin: '0 0 0.75rem' }}>
        Hoja de ruta #{viaje.id} · {descripcionVehiculo(viaje.Vehiculo)}
      </p>
      <Progreso hechas={resueltas(viaje)} total={viaje.Destinos.length} />
      <Link to={`/mis-viajes/${viaje.id}`} className="btn btn-grande" style={{ marginTop: '1rem' }}>
        {accion ?? 'Ver hoja de ruta'}
        <ChevronRight size={20} aria-hidden="true" />
      </Link>
    </section>
  );
}

function TarjetaViaje({ viaje }) {
  return (
    <Link to={`/mis-viajes/${viaje.id}`} className="card tarjeta-viaje">
      <div className="encabezado" style={{ marginBottom: '0.35rem' }}>
        <strong>Hoja de ruta #{viaje.id}</strong>
        <Badge estado={viaje.EstadoViaje.descripcion} />
      </div>
      <div>{descripcionVehiculo(viaje.Vehiculo)}</div>
      <div className="chico texto-suave">
        {resueltas(viaje)}/{viaje.Destinos.length} paradas
        {viaje.km_recorridos != null && ` · ${viaje.km_recorridos} km`}
        {' · '}
        {formatearFechaHora(viaje.fecha_salida ?? viaje.fecha_creacion)}
      </div>
    </Link>
  );
}

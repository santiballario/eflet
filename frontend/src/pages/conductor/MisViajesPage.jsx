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
import { descripcionVehiculo, diaLocal, diasHasta, formatearFecha, formatearFechaHora, hoyLocal } from '@/utils/formato';

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
  // El resumen se puede ver solo de hoy o de todos los viajes ('hoy' | 'total').
  // Va antes de los return de abajo: los hooks siempre tienen que llamarse en el mismo orden.
  const [periodo, setPeriodo] = useState('total');

  if (viajes.cargando || perfil.cargando) return <Cargando />;
  const error = viajes.error || perfil.error;
  if (error) return <Alerta>{error.message}</Alerta>;

  const yo = perfil.data;
  const pendientes = viajes.data.filter((v) => v.EstadoViaje.descripcion !== 'Finalizado');
  const finalizados = viajes.data.filter((v) => v.EstadoViaje.descripcion === 'Finalizado');
  const [actual, ...otros] = pendientes;

  // Resumen calculado con los viajes que ya trae la API.
  // "Hoy": viajes que volvieron hoy, y entregas de los viajes que salieron hoy
  // (asi cuentan tambien las del viaje que esta haciendo ahora).
  const diaHoy = hoyLocal();
  const esHoy = (fecha) => diaLocal(fecha) === diaHoy;
  const realizados = periodo === 'hoy' ? finalizados.filter((v) => esHoy(v.fecha_regreso)) : finalizados;
  const conEntregas = periodo === 'hoy' ? viajes.data.filter((v) => esHoy(v.fecha_salida)) : finalizados;
  const entregas = conEntregas.flatMap((v) => v.Destinos).filter((d) => d.estado_entrega === 'Entregado').length;
  const km = realizados.reduce((total, v) => total + (v.km_recorridos ?? 0), 0);
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

      {/* Celular: todo en una columna.
          Tablet y compu: el viaje de hoy y el resumen lado a lado, y abajo el
          historial ocupando todo el ancho (ver .conductor-panel en index.css) */}
      <div className="conductor-panel">
        <div className="panel-actual">
          {actual ? (
            <ViajeActual viaje={actual} />
          ) : (
            <div className="card vacio">No tenés viajes asignados por ahora.</div>
          )}

          {otros.length > 0 && (
            <ListaViajes titulo="Otros viajes asignados" viajes={otros} />
          )}
        </div>

        <section className="panel-resumen">
          <div className="resumen-encabezado">
            <h2>Tu resumen</h2>
            <div className="segmentado" role="group" aria-label="Período del resumen">
              <button type="button" aria-pressed={periodo === 'hoy'} onClick={() => setPeriodo('hoy')}>
                Hoy
              </button>
              <button type="button" aria-pressed={periodo === 'total'} onClick={() => setPeriodo('total')}>
                Total
              </button>
            </div>
          </div>
          <div className="stats">
            <StatCard titulo="Viajes realizados" valor={realizados.length} />
            <StatCard titulo="Entregas hechas" valor={entregas} />
            <StatCard titulo="Km recorridos" valor={km.toLocaleString('es-AR')} />
          </div>
        </section>

        {finalizados.length > 0 && (
          <div className="panel-historial">
            <ListaViajes titulo="Últimos viajes" viajes={finalizados.slice(0, 5)} />
          </div>
        )}
      </div>
    </>
  );
}

// Lista compacta: una fila por viaje dentro de una sola tarjeta
function ListaViajes({ titulo, viajes }) {
  return (
    <section>
      <h2 className="subtitulo-seccion">{titulo}</h2>
      <div className="card lista-viajes">
        {viajes.map((v) => (
          <FilaViaje key={v.id} viaje={v} />
        ))}
      </div>
    </section>
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

function FilaViaje({ viaje }) {
  return (
    <Link to={`/mis-viajes/${viaje.id}`} className="fila-viaje">
      <div className="fila-viaje-datos">
        <strong>Hoja de ruta #{viaje.id}</strong>
        <span className="chico texto-suave">
          {descripcionVehiculo(viaje.Vehiculo)} · {resueltas(viaje)}/{viaje.Destinos.length} paradas
          {viaje.km_recorridos != null && ` · ${viaje.km_recorridos} km`}
        </span>
      </div>
      <div className="fila-viaje-estado">
        <Badge estado={viaje.EstadoViaje.descripcion} />
        <span className="chico texto-suave">{formatearFechaHora(viaje.fecha_salida ?? viaje.fecha_creacion)}</span>
      </div>
      <ChevronRight size={18} aria-hidden="true" className="fila-viaje-flecha" />
    </Link>
  );
}

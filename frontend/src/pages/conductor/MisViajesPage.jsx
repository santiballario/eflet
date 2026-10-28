import { useState } from 'react';
import { Link } from 'react-router';
import { CalendarCheck, ChevronRight, Gauge, IdCard, PackageCheck, Route, Truck } from 'lucide-react';
import { useFetch } from '@/hooks/use-fetch';
import { listarViajes } from '@/services/viajes';
import { getMe } from '@/services/auth';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Cargando } from '@/components/ui/Cargando';
import { Progreso } from '@/components/ui/Progreso';
import { StatCard } from '@/components/ui/StatCard';
import { Vacio } from '@/components/ui/Vacio';
import {
  descripcionVehiculo,
  diaLocal,
  diasHasta,
  fechaDeHoyLarga,
  formatearFecha,
  formatearFechaHora,
  hoyLocal,
} from '@/utils/formato';
import { useTitulo } from '@/hooks/use-titulo';

const resueltas = (viaje) => viaje.Destinos.filter((d) => d.estado_entrega !== 'Pendiente').length;

// Pantalla de inicio del conductor (pensada para el celular):
// saludo, aviso de licencia, su viaje actual destacado, un resumen, su licencia y el historial.
// El backend ya devuelve solo los viajes de este conductor (filtra por el token).
export function MisViajesPage() {
  useTitulo('Mis viajes');
  const viajes = useFetch(() => listarViajes());
  const perfil = useFetch(getMe);
  // La fecha de hoy se calcula una sola vez al abrir la pantalla (no en cada render)
  const [hoy] = useState(fechaDeHoyLarga);
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
      {/* Mismo cartel con degradé que el inicio del administrador */}
      <div className="bienvenida bienvenida-conductor">
        <div>
          <p className="bienvenida-fecha">{hoy}</p>
          <h1>Hola, {yo.nombre}</h1>
          <p>
            {pendientes.length === 0
              ? 'No tenés viajes pendientes.'
              : `Tenés ${pendientes.length} ${pendientes.length === 1 ? 'viaje' : 'viajes'} por hacer.`}
          </p>
        </div>
        <Truck className="bienvenida-dibujo" size={130} strokeWidth={1.2} aria-hidden="true" />
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
          Tablet: el viaje de hoy y el resumen lado a lado, y abajo el historial.
          Compu: a la izquierda el viaje y el historial; a la derecha, una columna
          con el resumen y la licencia (ver .conductor-panel en index.css) */}
      <div className="conductor-panel">
        <div className="panel-actual">
          {actual ? (
            <ViajeActual viaje={actual} />
          ) : (
            <div className="card">
              <Vacio icono={CalendarCheck}>No tenés viajes asignados por ahora.</Vacio>
            </div>
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
            <StatCard titulo="Viajes realizados" valor={realizados.length} icono={Route} />
            <StatCard titulo="Entregas hechas" valor={entregas} icono={PackageCheck} />
            <StatCard titulo="Km recorridos" valor={km.toLocaleString('es-AR')} icono={Gauge} />
          </div>

          {yo.conductor && <TuLicencia conductor={yo.conductor} dias={diasLicencia} />}
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

// Tarjeta con el numero de licencia, el vencimiento y si esta vigente
function TuLicencia({ conductor, dias }) {
  const estado =
    dias < 0
      ? { clase: 'error', texto: 'Vencida' }
      : dias <= 30
        ? { clase: 'advertencia', texto: `Vence en ${dias} días` }
        : { clase: 'exito', texto: 'Vigente' };

  return (
    <div className="card tarjeta-licencia">
      <span className="stat-icono">
        <IdCard size={20} aria-hidden="true" />
      </span>
      <div className="etiqueta">Tu licencia</div>
      <div className="licencia-numero">{conductor.nro_licencia}</div>
      <div className="licencia-vence">
        <span className="chico texto-suave">Vence el {formatearFecha(conductor.vencimiento_licencia)}</span>
        <span className={`badge badge-${estado.clase}`}>{estado.texto}</span>
      </div>
    </div>
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

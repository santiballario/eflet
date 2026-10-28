import { useState } from 'react';
import { Link } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { listarViajes } from '@/services/viajes';
import { listarEstadosViaje } from '@/services/catalogos';
import { Alerta } from '@/components/ui/Alerta';
import { Cargando } from '@/components/ui/Cargando';
import { Search, SearchX } from 'lucide-react';
import { TablaViajes } from '@/components/TablaViajes';
import { Vacio } from '@/components/ui/Vacio';
import { diaLocal, nombreConductor } from '@/utils/formato';
import { useTitulo } from '@/hooks/use-titulo';

// Dia de un viaje: el de la salida; si todavia no salio, el dia en que se armo.
const diaDelViaje = (viaje) => diaLocal(viaje.fecha_salida ?? viaje.fecha_creacion);
const tieneNoEntregadas = (viaje) => viaje.Destinos?.some((d) => d.estado_entrega === 'No entregado');
// La busqueda compara contra la patente y el nombre del conductor, sin importar mayusculas.
const coincide = (viaje, texto) =>
  `${viaje.Vehiculo?.patente ?? ''} ${nombreConductor(viaje.Conductor)}`.toLowerCase().includes(texto.trim().toLowerCase());

export function ViajesPage() {
  useTitulo('Hojas de Ruta');
  const [estado, setEstado] = useState('');
  const [dia, setDia] = useState('');
  const [soloNoEntregadas, setSoloNoEntregadas] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // El estado lo filtra el backend: cada vez que cambia, useFetch vuelve a pedir
  // la lista ([estado] = dependencias). El dia y las no entregadas se filtran
  // aca, sobre esa lista.
  const { data: viajes, error, cargando } = useFetch(() => listarViajes({ estado }), [estado]);
  const { data: estados } = useFetch(listarEstadosViaje);

  const filtrados = viajes?.filter(
    (v) =>
      (!dia || diaDelViaje(v) === dia) &&
      (!soloNoEntregadas || tieneNoEntregadas(v)) &&
      (!busqueda.trim() || coincide(v, busqueda))
  );
  const hayFiltros = estado || dia || soloNoEntregadas || busqueda.trim();

  function limpiarFiltros() {
    setEstado('');
    setDia('');
    setSoloNoEntregadas(false);
    setBusqueda('');
  }

  return (
    <>
      <div className="encabezado">
        <h1>Hojas de Ruta</h1>
        <Link to="/viajes/nuevo" className="btn">
          + Nuevo viaje
        </Link>
      </div>

      <div className="filtros">
        <label className="filtro">
          <span>Buscar</span>
          <span className="buscador">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder="Patente o conductor"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </span>
        </label>
        <label className="filtro">
          <span>Estado</span>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            {estados?.map((e) => (
              <option key={e.id} value={e.descripcion}>
                {e.descripcion}
              </option>
            ))}
          </select>
        </label>
        <label className="filtro">
          <span>Día</span>
          <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
        </label>
        <label className="filtro-check">
          <input
            type="checkbox"
            checked={soloNoEntregadas}
            onChange={(e) => setSoloNoEntregadas(e.target.checked)}
          />
          Con paradas no entregadas
        </label>
        {hayFiltros && (
          <button
            type="button"
            className="btn btn-secundario btn-chico"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        )}
        {filtrados && <span className="chico texto-suave filtros-total">{filtrados.length} viajes</span>}
      </div>

      <div className="card">
        {cargando && <Cargando />}
        {error && <Alerta>{error.message}</Alerta>}
        {!cargando && filtrados?.length === 0 && hayFiltros ? (
          <Vacio
            icono={SearchX}
            accion={
              <button type="button" className="btn btn-secundario btn-chico" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            }
          >
            Ningún viaje coincide con estos filtros.
          </Vacio>
        ) : (
          !cargando && filtrados && <TablaViajes viajes={filtrados} />
        )}
      </div>
    </>
  );
}

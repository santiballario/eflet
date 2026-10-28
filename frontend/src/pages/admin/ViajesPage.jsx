import { useState } from 'react';
import { Link } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { listarViajes } from '@/services/viajes';
import { listarEstadosViaje } from '@/services/catalogos';
import { Alerta } from '@/components/ui/Alerta';
import { Cargando } from '@/components/ui/Cargando';
import { TablaViajes } from '@/components/TablaViajes';
import { diaLocal } from '@/utils/formato';

// Dia de un viaje: el de la salida; si todavia no salio, el dia en que se armo.
const diaDelViaje = (viaje) => diaLocal(viaje.fecha_salida ?? viaje.fecha_creacion);
const tieneNoEntregadas = (viaje) => viaje.Destinos?.some((d) => d.estado_entrega === 'No entregado');

export function ViajesPage() {
  const [estado, setEstado] = useState('');
  const [dia, setDia] = useState('');
  const [soloNoEntregadas, setSoloNoEntregadas] = useState(false);

  // El estado lo filtra el backend: cada vez que cambia, useFetch vuelve a pedir
  // la lista ([estado] = dependencias). El dia y las no entregadas se filtran
  // aca, sobre esa lista.
  const { data: viajes, error, cargando } = useFetch(() => listarViajes({ estado }), [estado]);
  const { data: estados } = useFetch(listarEstadosViaje);

  const filtrados = viajes?.filter(
    (v) => (!dia || diaDelViaje(v) === dia) && (!soloNoEntregadas || tieneNoEntregadas(v))
  );
  const hayFiltros = estado || dia || soloNoEntregadas;

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
            onClick={() => {
              setEstado('');
              setDia('');
              setSoloNoEntregadas(false);
            }}
          >
            Limpiar filtros
          </button>
        )}
        {filtrados && <span className="chico texto-suave filtros-total">{filtrados.length} viajes</span>}
      </div>

      <div className="card">
        {cargando && <Cargando />}
        {error && <Alerta>{error.message}</Alerta>}
        {!cargando && filtrados && <TablaViajes viajes={filtrados} />}
      </div>
    </>
  );
}

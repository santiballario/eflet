import { useState } from 'react';
import { Link } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { listarViajes } from '@/services/viajes';
import { listarEstadosViaje } from '@/services/catalogos';
import { Alerta } from '@/components/ui/Alerta';
import { Cargando } from '@/components/ui/Cargando';
import { TablaViajes } from '@/components/TablaViajes';

export function ViajesPage() {
  const [estado, setEstado] = useState('');

  // Cada vez que cambia el filtro, useFetch vuelve a pedir la lista ([estado] = dependencias).
  const { data: viajes, error, cargando } = useFetch(() => listarViajes({ estado }), [estado]);
  const { data: estados } = useFetch(listarEstadosViaje);

  return (
    <>
      <div className="encabezado">
        <h1>Hojas de Ruta</h1>
        <div className="acciones">
          <select className="btn btn-secundario" value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {estados?.map((e) => (
              <option key={e.id} value={e.descripcion}>
                {e.descripcion}
              </option>
            ))}
          </select>
          <Link to="/viajes/nuevo" className="btn">
            + Nuevo viaje
          </Link>
        </div>
      </div>

      <div className="card">
        {cargando && <Cargando />}
        {error && <Alerta>{error.message}</Alerta>}
        {!cargando && viajes && <TablaViajes viajes={viajes} />}
      </div>
    </>
  );
}

import { useState } from 'react';
import { Link } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { eliminarVehiculo, listarVehiculos } from '@/services/vehiculos';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Cargando } from '@/components/ui/Cargando';
import { diasHasta, formatearFecha } from '@/utils/formato';

function EstadoVtv({ fecha }) {
  const dias = diasHasta(fecha);
  if (dias < 0) return <span className="badge badge-error">Vencida</span>;
  if (dias <= 30) return <span className="badge badge-advertencia">Vence en {dias} días</span>;
  return null;
}

export function VehiculosPage() {
  const { data: vehiculos, error, cargando, recargar } = useFetch(listarVehiculos);
  const [errorAccion, setErrorAccion] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [busqueda, setBusqueda] = useState('');

  async function handleEliminar(vehiculo) {
    if (!window.confirm(`¿Dar de baja el vehículo ${vehiculo.patente}?`)) return;
    setErrorAccion('');
    setMensajeExito('');
    try {
      await eliminarVehiculo(vehiculo.id);
      setMensajeExito('Vehículo eliminado exitosamente.');
      recargar();
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (err) {
      setErrorAccion(err.message);
    }
  }

  const vehiculosFiltrados = vehiculos?.filter((v) =>
    v.patente.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <div className="encabezado" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Gestión de Flota</h1>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por patente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
            />
          </div>
        </div>
        <Link to="/vehiculos/nuevo" className="btn">
          + Nuevo vehículo
        </Link>
      </div>

      <Alerta>{errorAccion}</Alerta>

      {mensajeExito && (
        <div style={{ backgroundColor: '#10B981', color: 'white', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 'bold' }}>
          {mensajeExito}
        </div>
      )}

      <div className="card">
        {cargando && <Cargando />}
        {error && <Alerta>{error.message}</Alerta>}
        
        {!cargando && vehiculos?.length === 0 && (
          <div className="vacio">Todavía no hay vehículos cargados.</div>
        )}

        {vehiculos?.length > 0 && vehiculosFiltrados?.length === 0 && (
          <div className="vacio">No se encontraron resultados para "{busqueda}".</div>
        )}

        {vehiculosFiltrados?.length > 0 && (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Patente</th>
                  <th>Marca / Modelo</th>
                  <th>Capacidad</th>
                  <th>VTV</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vehiculosFiltrados.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.patente}</strong>
                    </td>
                    <td>
                      {v.marca} {v.modelo}
                    </td>
                    <td>{Number(v.cantidad_maxima)} kg</td>
                    <td>
                      {formatearFecha(v.vencimiento_vtv)} <EstadoVtv fecha={v.vencimiento_vtv} />
                    </td>
                    <td>
                      <Badge estado={v.estado} />
                    </td>
                    <td>
                      <div className="acciones">
                        <Link to={`/vehiculos/${v.id}/editar`} className="btn btn-secundario btn-chico">
                          Editar
                        </Link>
                        <button className="btn btn-peligro btn-chico" onClick={() => handleEliminar(v)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
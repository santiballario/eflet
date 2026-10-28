import { useState } from 'react';
import { Link } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { eliminarVehiculo, listarVehiculos } from '@/services/vehiculos';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Cargando } from '@/components/ui/Cargando';
import { diasHasta, formatearFecha } from '@/utils/formato';
import { Search } from 'lucide-react';


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
      <div className="encabezado">
        <div className="titulo-con-buscador">
          <h1>Gestión de Flota</h1>
          <div className="buscador">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por patente..."
              aria-label="Buscar por patente"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        <Link to="/vehiculos/nuevo" className="btn">
          + Nuevo vehículo
        </Link>
      </div>

      <Alerta>{errorAccion}</Alerta>

      {/* Verde con texto oscuro: el blanco sobre #10B981 no llega al contraste minimo */}
      <Alerta tipo="exito">{mensajeExito}</Alerta>

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
            <table className="tabla-responsive">
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
                    <td data-label="Patente">
                      <strong>{v.patente}</strong>
                    </td>
                    <td data-label="Marca / Modelo">
                      {v.marca} {v.modelo}
                    </td>
                    <td data-label="Capacidad">{Number(v.cantidad_maxima)} kg</td>
                    <td data-label="VTV">
                      <span>
                        {formatearFecha(v.vencimiento_vtv)} <EstadoVtv fecha={v.vencimiento_vtv} />
                      </span>
                    </td>
                    <td data-label="Estado">
                      <Badge estado={v.estado} />
                    </td>
                    <td data-label="">
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
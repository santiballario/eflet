import { useState } from 'react';
import { Link } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { eliminarVehiculo, listarVehiculos } from '@/services/vehiculos';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Cargando } from '@/components/ui/Cargando';
import { diasHasta, formatearFecha } from '@/utils/formato';

// Aviso de VTV: vencida (rojo) o por vencer en los proximos 30 dias (amarillo).
function EstadoVtv({ fecha }) {
  const dias = diasHasta(fecha);
  if (dias < 0) return <span className="badge badge-error">Vencida</span>;
  if (dias <= 30) return <span className="badge badge-advertencia">Vence en {dias} días</span>;
  return null;
}

export function VehiculosPage() {
  const { data: vehiculos, error, cargando, recargar } = useFetch(listarVehiculos);
  const [errorAccion, setErrorAccion] = useState('');

  async function handleEliminar(vehiculo) {
    if (!window.confirm(`¿Dar de baja el vehículo ${vehiculo.patente}?`)) return;
    setErrorAccion('');
    try {
      await eliminarVehiculo(vehiculo.id);
      recargar();
    } catch (err) {
      // 409 si esta asignado a un viaje sin finalizar
      setErrorAccion(err.message);
    }
  }

  return (
    <>
      <div className="encabezado">
        <h1>Gestión de Flota</h1>
        <Link to="/vehiculos/nuevo" className="btn">
          + Nuevo vehículo
        </Link>
      </div>

      <Alerta>{errorAccion}</Alerta>

      <div className="card">
        {cargando && <Cargando />}
        {error && <Alerta>{error.message}</Alerta>}
        {vehiculos?.length === 0 && <div className="vacio">Todavía no hay vehículos cargados.</div>}

        {vehiculos?.length > 0 && (
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
                {/* key: React la usa para saber que fila es cual al re-renderizar */}
                {vehiculos.map((v) => (
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

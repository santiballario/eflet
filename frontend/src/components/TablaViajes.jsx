import { useNavigate } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { descripcionVehiculo, formatearFechaHora, nombreConductor } from '@/utils/formato';

// Columnas del documento de diseno: ID, Vehiculo, Conductor, Cantidad destinos, Estado.
// Se usa en el Panel de Control y en Hojas de Ruta. Click en la fila = ver detalle.
export function TablaViajes({ viajes }) {
  const navigate = useNavigate();

  if (viajes.length === 0) return <div className="vacio">No hay hojas de ruta para mostrar.</div>;

  return (
    <div className="tabla-contenedor">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vehículo</th>
            <th>Conductor</th>
            <th>Destinos</th>
            <th>Creado</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {viajes.map((v) => (
            <tr key={v.id} onClick={() => navigate(`/viajes/${v.id}`)} style={{ cursor: 'pointer' }}>
              <td>#{v.id}</td>
              <td>{descripcionVehiculo(v.Vehiculo)}</td>
              <td>{nombreConductor(v.Conductor)}</td>
              <td>{v.Destinos?.length ?? 0}</td>
              <td>{formatearFechaHora(v.fecha_creacion)}</td>
              <td>
                <Badge estado={v.EstadoViaje?.descripcion} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

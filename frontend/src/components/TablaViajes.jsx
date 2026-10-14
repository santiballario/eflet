import { useNavigate } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { descripcionVehiculo, formatearFechaHora, nombreConductor } from '@/utils/formato';

// Columnas del documento de diseno: ID, Vehiculo, Conductor, Cantidad destinos, Estado.
// Se usa en el Panel de Control y en Hojas de Ruta. Click en la fila = ver detalle.
//
// "tabla-responsive": en pantallas chicas cada fila se muestra como una tarjeta
// (ver index.css). El data-label de cada celda es el titulo que aparece a la
// izquierda del dato cuando la tabla se convierte en tarjetas.
export function TablaViajes({ viajes }) {
  const navigate = useNavigate();

  if (viajes.length === 0) return <div className="vacio">No hay hojas de ruta para mostrar.</div>;

  return (
    <div className="tabla-contenedor">
      <table className="tabla-responsive">
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
              <td data-label="ID">#{v.id}</td>
              <td data-label="Vehículo">{descripcionVehiculo(v.Vehiculo)}</td>
              <td data-label="Conductor">{nombreConductor(v.Conductor)}</td>
              <td data-label="Destinos">{v.Destinos?.length ?? 0}</td>
              <td data-label="Creado">{formatearFechaHora(v.fecha_creacion)}</td>
              <td data-label="Estado">
                <Badge estado={v.EstadoViaje?.descripcion} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

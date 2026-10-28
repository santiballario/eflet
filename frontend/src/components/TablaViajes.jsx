import { useNavigate } from 'react-router';
import { Route } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Vacio } from '@/components/ui/Vacio';
import { descripcionVehiculo, formatearFechaHora, nombreConductor } from '@/utils/formato';
import { Avatar } from '@/components/ui/Avatar';

// Columnas del documento de diseno: ID, Vehiculo, Conductor, Cantidad destinos, Estado.
// Se usa en el Panel de Control y en Hojas de Ruta. Click en la fila = ver detalle.
//
// "tabla-responsive": en pantallas chicas cada fila se muestra como una tarjeta
// (ver index.css). El data-label de cada celda es el titulo que aparece a la
// izquierda del dato cuando la tabla se convierte en tarjetas.
export function TablaViajes({ viajes }) {
  const navigate = useNavigate();

  if (viajes.length === 0) return <Vacio icono={Route}>No hay hojas de ruta para mostrar.</Vacio>;

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
              <td data-label="Vehículo">
                {descripcionVehiculo(v.Vehiculo)}
                {v.Vehiculo?.fecha_eliminacion && <span className="chico texto-suave"> (de baja)</span>}
              </td>
              <td data-label="Conductor">
                <span className="persona">
                  <Avatar
                    nombre={v.Conductor?.Usuario?.Persona?.nombre}
                    apellido={v.Conductor?.Usuario?.Persona?.apellido}
                    chico
                  />
                  {nombreConductor(v.Conductor)}
                  {v.Conductor?.fecha_eliminacion && <span className="chico texto-suave">(de baja)</span>}
                </span>
              </td>
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

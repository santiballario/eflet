import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatearHora } from '@/utils/formato';

// Link de Google Maps que busca la direccion (no necesita clave ni API).
const linkMapa = (direccion) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;

// Paradas de la hoja de ruta en orden. `acciones` (opcional) es una funcion
// que recibe el destino y devuelve los botones a mostrar: asi el mismo
// componente sirve para el administrador y para el conductor.
// `conMapa`: muestra "Ver en el mapa" en las paradas pendientes (para el conductor).
export function ListaDestinos({ destinos, acciones, conMapa = false }) {
  return (
    <div>
      {destinos.map((d) => (
        <div key={d.id} className="destino">
          <div className="orden">{d.orden}</div>
          <div className="detalle">
            <div>
              <strong>{d.direccion_farmacia}</strong>
            </div>
            <div className="chico texto-suave">
              {d.cantidad_bultos} bulto{d.cantidad_bultos === 1 ? '' : 's'}
              {conMapa && d.estado_entrega === 'Pendiente' && (
                <>
                  {' · '}
                  <a href={linkMapa(d.direccion_farmacia)} target="_blank" rel="noopener noreferrer" className="link-mapa">
                    <MapPin size={14} aria-hidden="true" />
                    Ver en el mapa
                  </a>
                </>
              )}
            </div>
            <div style={{ marginTop: '0.3rem' }}>
              <Badge estado={d.estado_entrega} />
              {d.fecha_entrega && <span className="chico texto-suave"> a las {formatearHora(d.fecha_entrega)}</span>}
              {d.MotivoNoEntrega && (
                <span className="chico texto-suave">
                  {' '}— {d.MotivoNoEntrega.descripcion}
                  {d.detalle_motivo && `: ${d.detalle_motivo}`}
                </span>
              )}
            </div>
            {acciones && <div style={{ marginTop: '0.6rem' }}>{acciones(d)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

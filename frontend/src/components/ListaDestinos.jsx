import { Badge } from '@/components/ui/Badge';

// Paradas de la hoja de ruta en orden. `acciones` (opcional) es una funcion
// que recibe el destino y devuelve los botones a mostrar: asi el mismo
// componente sirve para el administrador y para el conductor.
export function ListaDestinos({ destinos, acciones }) {
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
            </div>
            <div style={{ marginTop: '0.3rem' }}>
              <Badge estado={d.estado_entrega} />
              {d.MotivoNoEntrega && <span className="chico texto-suave"> — {d.MotivoNoEntrega.descripcion}</span>}
            </div>
            {acciones && <div style={{ marginTop: '0.6rem' }}>{acciones(d)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

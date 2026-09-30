import { useState } from 'react';
import { Link } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { eliminarConductor, listarConductores } from '@/services/conductores';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Cargando } from '@/components/ui/Cargando';
import { diasHasta, formatearFecha, nombreConductor } from '@/utils/formato';

function EstadoLicencia({ fecha }) {
  const dias = diasHasta(fecha);
  if (dias < 0) return <span className="badge badge-error">Vencida</span>;
  if (dias <= 30) return <span className="badge badge-advertencia">Vence en {dias} días</span>;
  return null;
}

export function ConductoresPage() {
  const { data: conductores, error, cargando, recargar } = useFetch(listarConductores);
  const [errorAccion, setErrorAccion] = useState('');

  async function handleEliminar(conductor) {
    if (!window.confirm(`¿Dar de baja a ${nombreConductor(conductor)}? Ya no va a poder ingresar al sistema.`)) return;
    setErrorAccion('');
    try {
      await eliminarConductor(conductor.id);
      recargar();
    } catch (err) {
      setErrorAccion(err.message); // 409 si tiene un viaje sin finalizar
    }
  }

  return (
    <>
      <div className="encabezado">
        <h1>Conductores</h1>
        <Link to="/conductores/nuevo" className="btn">
          + Nuevo conductor
        </Link>
      </div>

      <Alerta>{errorAccion}</Alerta>

      <div className="card">
        {cargando && <Cargando />}
        {error && <Alerta>{error.message}</Alerta>}
        {conductores?.length === 0 && <div className="vacio">Todavía no hay conductores cargados.</div>}

        {conductores?.length > 0 && (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Licencia</th>
                  <th>Disponibilidad</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {conductores.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{nombreConductor(c)}</strong>
                    </td>
                    <td>{c.Usuario?.Persona?.dni}</td>
                    <td>{c.Usuario?.email}</td>
                    <td>{c.Usuario?.Persona?.telefono}</td>
                    <td>
                      {c.nro_licencia}
                      <div className="chico texto-suave">
                        vence {formatearFecha(c.vencimiento_licencia)} <EstadoLicencia fecha={c.vencimiento_licencia} />
                      </div>
                    </td>
                    <td>
                      <Badge estado={c.disponibilidad} />
                    </td>
                    <td>
                      <div className="acciones">
                        <Link to={`/conductores/${c.id}/editar`} className="btn btn-secundario btn-chico">
                          Editar
                        </Link>
                        <button className="btn btn-peligro btn-chico" onClick={() => handleEliminar(c)}>
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

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
  const [mensajeExito, setMensajeExito] = useState('');
  const [busqueda, setBusqueda] = useState('');

  async function handleEliminar(conductor) {
    if (!window.confirm(`¿Dar de baja a ${nombreConductor(conductor)}? Ya no va a poder ingresar al sistema.`)) return;
    setErrorAccion('');
    setMensajeExito('');
    try {
      await eliminarConductor(conductor.id);
      setMensajeExito('Conductor eliminado exitosamente.');
      recargar();
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (err) {
      setErrorAccion(err.message);
    }
  }

  const conductoresFiltrados = conductores?.filter((c) => {
    const termino = busqueda.toLowerCase();
    const nombre = nombreConductor(c).toLowerCase();
    const dni = c.Usuario?.Persona?.dni || '';
    return nombre.includes(termino) || dni.includes(termino);
  });

  return (
    <>
      <div className="encabezado" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Conductores</h1>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
            />
          </div>
        </div>
        <Link to="/conductores/nuevo" className="btn">
          + Nuevo conductor
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
        
        {!cargando && conductores?.length === 0 && (
          <div className="vacio">Todavía no hay conductores cargados.</div>
        )}

        {conductores?.length > 0 && conductoresFiltrados?.length === 0 && (
          <div className="vacio">No se encontraron resultados para "{busqueda}".</div>
        )}

        {conductoresFiltrados?.length > 0 && (
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
                {conductoresFiltrados.map((c) => (
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
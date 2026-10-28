import { useState } from 'react';
import { Link } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { eliminarConductor, listarConductores } from '@/services/conductores';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Cargando } from '@/components/ui/Cargando';
import { diasHasta, formatearFecha, nombreConductor } from '@/utils/formato';
import { Search } from 'lucide-react';

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
      <div className="encabezado">
        <div className="titulo-con-buscador">
          <h1>Conductores</h1>
          <div className="buscador">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por nombre o DNI..."
              aria-label="Buscar por nombre o DNI"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        <Link to="/conductores/nuevo" className="btn">
          + Nuevo conductor
        </Link>
      </div>

      <Alerta>{errorAccion}</Alerta>
      
      {/* Verde con texto oscuro: el blanco sobre #10B981 no llega al contraste minimo */}
      <Alerta tipo="exito">{mensajeExito}</Alerta>

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
            <table className="tabla-responsive">
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
                    <td data-label="Nombre">
                      <strong>{nombreConductor(c)}</strong>
                    </td>
                    <td data-label="DNI">{c.Usuario?.Persona?.dni}</td>
                    <td data-label="Email">{c.Usuario?.email}</td>
                    <td data-label="Teléfono">{c.Usuario?.Persona?.telefono}</td>
                    <td data-label="Licencia">
                      <div>
                        {c.nro_licencia}
                        <div className="chico texto-suave">
                          vence {formatearFecha(c.vencimiento_licencia)} <EstadoLicencia fecha={c.vencimiento_licencia} />
                        </div>
                      </div>
                    </td>
                    <td data-label="Disponibilidad">
                      <Badge estado={c.disponibilidad} />
                    </td>
                    <td data-label="">
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
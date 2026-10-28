import { useState } from 'react';
import { Link } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { eliminarVehiculo, listarVehiculos } from '@/services/vehiculos';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Cargando } from '@/components/ui/Cargando';
import { Vacio } from '@/components/ui/Vacio';
import { useConfirmar } from '@/components/ui/confirmar-context';
import { diasHasta, formatearFecha } from '@/utils/formato';
import { Search, SearchX, Truck } from 'lucide-react';
import { useTitulo } from '@/hooks/use-titulo';
import { useAvisos } from '@/components/ui/avisos-context';


function EstadoVtv({ fecha }) {
  const dias = diasHasta(fecha);
  if (dias < 0) return <span className="badge badge-error">Vencida</span>;
  if (dias <= 30) return <span className="badge badge-advertencia">Vence en {dias} días</span>;
  return null;
}

export function VehiculosPage() {
  useTitulo('Gestión de Flota');
  const { data: vehiculos, error, cargando, recargar } = useFetch(listarVehiculos);
  const [errorAccion, setErrorAccion] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const confirmar = useConfirmar();
  const avisar = useAvisos();

  async function handleEliminar(vehiculo) {
    const seguro = await confirmar({
      titulo: `¿Dar de baja el vehículo ${vehiculo.patente}?`,
      mensaje: 'Deja de aparecer para armar viajes. Los viajes que ya hizo se conservan.',
      textoConfirmar: 'Dar de baja',
      peligro: true,
    });
    if (!seguro) return;
    setErrorAccion('');
    try {
      await eliminarVehiculo(vehiculo.id);
      avisar('Vehículo dado de baja.');
      recargar();
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

      <div className="card">
        {cargando && <Cargando />}
        {error && <Alerta>{error.message}</Alerta>}
        
        {!cargando && vehiculos?.length === 0 && (
          <Vacio icono={Truck}>Todavía no hay vehículos cargados.</Vacio>
        )}

        {vehiculos?.length > 0 && vehiculosFiltrados?.length === 0 && (
          <Vacio icono={SearchX}>No se encontraron resultados para "{busqueda}".</Vacio>
        )}

        {vehiculosFiltrados?.length > 0 && (
          <div className="tabla-contenedor">
            <table className="tabla-responsive">
              <thead>
                <tr>
                  <th>Patente</th>
                  <th>Marca / Modelo</th>
                  <th>Capacidad</th>
                  <th>Último km</th>
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
                    {/* km registrado al volver de su ultimo viaje (lo calcula el backend) */}
                    <td data-label="Último km">
                      {v.ultimo_km != null ? `${v.ultimo_km.toLocaleString('es-AR')} km` : <span className="texto-suave">Sin viajes</span>}
                    </td>
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
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Trash2 } from 'lucide-react';
import { useFetch } from '@/hooks/use-fetch';
import { listarVehiculos } from '@/services/vehiculos';
import { listarConductores } from '@/services/conductores';
import { crearViaje } from '@/services/viajes';
import { Alerta } from '@/components/ui/Alerta';
import { Campo } from '@/components/ui/Campo';
import { Cargando } from '@/components/ui/Cargando';
import { diasHasta, nombreConductor } from '@/utils/formato';
import { useTitulo } from '@/hooks/use-titulo';
import { useAvisos } from '@/components/ui/avisos-context';

const PARADA_VACIA = { direccion_farmacia: '', cantidad_bultos: 1 };

// Pantalla "Crear Hoja de Ruta" del documento de diseno.
export function ViajeNuevoPage() {
  useTitulo('Nuevo viaje');
  const avisar = useAvisos();
  const navigate = useNavigate();
  const vehiculos = useFetch(listarVehiculos);
  const conductores = useFetch(listarConductores);

  const [vehiculoId, setVehiculoId] = useState('');
  const [conductorId, setConductorId] = useState('');
  const [paradas, setParadas] = useState([{ ...PARADA_VACIA }]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // En los desplegables mostramos solo lo que se puede asignar. Es solo para
  // ayudar al usuario: el backend vuelve a validar todo (VTV, licencia, estado).
  const vehiculosAptos = vehiculos.data?.filter((v) => v.estado === 'Activo' && diasHasta(v.vencimiento_vtv) >= 0) ?? [];
  const conductoresAptos =
    conductores.data?.filter((c) => c.disponibilidad === 'Disponible' && diasHasta(c.vencimiento_licencia) >= 0) ?? [];

  // El estado es inmutable: en vez de modificar el array, armamos uno nuevo.
  function cambiarParada(indice, campo, valor) {
    setParadas(paradas.map((p, i) => (i === indice ? { ...p, [campo]: valor } : p)));
  }

  function agregarParada() {
    setParadas([...paradas, { ...PARADA_VACIA }]);
  }

  function quitarParada(indice) {
    setParadas(paradas.filter((_, i) => i !== indice));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const viaje = await crearViaje({
        vehiculo_id: Number(vehiculoId),
        conductor_id: Number(conductorId),
        // el orden de las paradas es el orden en que se cargaron
        destinos: paradas.map((p, i) => ({ ...p, orden: i + 1, cantidad_bultos: Number(p.cantidad_bultos) })),
      });
      avisar(`Hoja de ruta #${viaje.id} creada.`);
      navigate(`/viajes/${viaje.id}`);
    } catch (err) {
      // ej: 409 "El vehiculo tiene la VTV vencida." o "ya esta asignado a otro viaje"
      setError(err.message);
      setEnviando(false);
    }
  }

  if (vehiculos.cargando || conductores.cargando) return <Cargando />;

  return (
    <>
      <h1>Crear Hoja de Ruta</h1>
      <form className="card formulario" onSubmit={handleSubmit}>
        <Alerta>{error || vehiculos.error?.message || conductores.error?.message}</Alerta>

        <div className="fila">
          <Campo label="Vehículo" as="select" value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)} required>
            <option value="">Seleccionar vehículo...</option>
            {vehiculosAptos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.patente} - {v.marca} {v.modelo} ({Number(v.cantidad_maxima)} kg)
              </option>
            ))}
          </Campo>
          <Campo label="Conductor" as="select" value={conductorId} onChange={(e) => setConductorId(e.target.value)} required>
            <option value="">Seleccionar conductor...</option>
            {conductoresAptos.map((c) => (
              <option key={c.id} value={c.id}>
                {nombreConductor(c)}
              </option>
            ))}
          </Campo>
        </div>
        {(vehiculosAptos.length === 0 || conductoresAptos.length === 0) && (
          <Alerta tipo="advertencia">
            Solo aparecen vehículos activos con VTV vigente y conductores disponibles con licencia vigente.
          </Alerta>
        )}

        <h2>Destinos</h2>
        {paradas.map((p, i) => (
          // Las paradas nuevas no tienen id todavia: usamos el indice como key.
          <div key={i} className="parada-form">
            <Campo
              label={`Parada ${i + 1} - Dirección de la farmacia`}
              value={p.direccion_farmacia}
              onChange={(e) => cambiarParada(i, 'direccion_farmacia', e.target.value)}
              placeholder="Ej: Farmacia Central - Calle 7 N° 1234, La Plata"
              maxLength={200}
              required
            />
            <Campo
              label="Bultos"
              type="number"
              min="1"
              max="1000"
              value={p.cantidad_bultos}
              onChange={(e) => cambiarParada(i, 'cantidad_bultos', e.target.value)}
              required
            />
            <button
              type="button"
              className="btn btn-secundario"
              onClick={() => quitarParada(i)}
              disabled={paradas.length === 1}
              aria-label={`Quitar parada ${i + 1}`}
              title="Quitar parada"
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </div>
        ))}
        <div>
          {/* El backend acepta hasta 50 paradas por viaje */}
          <button type="button" className="btn btn-secundario" onClick={agregarParada} disabled={paradas.length >= 50}>
            + Añadir Parada
          </button>
        </div>

        <div className="acciones">
          <Link to="/viajes" className="btn btn-secundario">
            Cancelar
          </Link>
          <button className="btn" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Guardar Viaje'}
          </button>
        </div>
      </form>
    </>
  );
}

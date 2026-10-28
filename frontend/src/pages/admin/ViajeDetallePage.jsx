import { useState } from 'react';
import { Pencil, Printer } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { actualizarViaje, agregarDestino, eliminarDestino, eliminarViaje, listarViajes, obtenerViaje } from '@/services/viajes';
import { listarVehiculos } from '@/services/vehiculos';
import { listarConductores } from '@/services/conductores';
import { OpcionesConductor, OpcionesVehiculo } from '@/components/OpcionesAsignacion';
import { ocupadosPorViajes } from '@/utils/aptitud';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Campo } from '@/components/ui/Campo';
import { Cargando } from '@/components/ui/Cargando';
import { ListaDestinos } from '@/components/ListaDestinos';
import { LineaEstados } from '@/components/LineaEstados';
import { useConfirmar } from '@/components/ui/confirmar-context';
import { descripcionVehiculo, formatearFechaHora, nombreConductor } from '@/utils/formato';
import { useTitulo } from '@/hooks/use-titulo';
import { useAvisos } from '@/components/ui/avisos-context';

function Dato({ etiqueta, children }) {
  return (
    <div>
      <div className="etiqueta">{etiqueta}</div>
      <div>{children ?? '-'}</div>
    </div>
  );
}

// El viaje se conserva aunque el conductor o el vehiculo se hayan dado de baja despues
function DeBaja() {
  return <div className="chico texto-suave">Dado de baja</div>;
}

// Cambiar el vehiculo o el conductor de un viaje que todavia esta En Depósito.
// Las listas se piden recien al abrir el formulario.
function EditarAsignacion({ viaje, alGuardar, alCancelar }) {
  const vehiculos = useFetch(listarVehiculos);
  const conductores = useFetch(listarConductores);
  const viajes = useFetch(() => listarViajes());
  const [vehiculoId, setVehiculoId] = useState(String(viaje.vehiculo_id));
  const [conductorId, setConductorId] = useState(String(viaje.conductor_id));
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (vehiculos.cargando || conductores.cargando || viajes.cargando) return <Cargando />;

  // Este mismo viaje no cuenta como "ocupado": su vehiculo y su conductor se pueden mantener
  const vehiculosOcupados = ocupadosPorViajes(viajes.data, 'vehiculo_id', viaje.id);
  const conductoresOcupados = ocupadosPorViajes(viajes.data, 'conductor_id', viaje.id);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await actualizarViaje(viaje.id, { vehiculo_id: Number(vehiculoId), conductor_id: Number(conductorId) });
      alGuardar();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <form className="card formulario" onSubmit={handleSubmit}>
      <h2 style={{ margin: 0 }}>Cambiar vehículo o conductor</h2>
      <Alerta>{error || vehiculos.error?.message || conductores.error?.message}</Alerta>
      <div className="fila">
        <Campo label="Vehículo" as="select" value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)} required>
          <OpcionesVehiculo vehiculos={vehiculos.data ?? []} ocupados={vehiculosOcupados} />
        </Campo>
        <Campo label="Conductor" as="select" value={conductorId} onChange={(e) => setConductorId(e.target.value)} required>
          <OpcionesConductor conductores={conductores.data ?? []} ocupados={conductoresOcupados} />
        </Campo>
      </div>
      <div className="acciones">
        <button type="button" className="btn btn-secundario" onClick={alCancelar}>
          Cancelar
        </button>
        <button className="btn" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

export function ViajeDetallePage() {
  const { id } = useParams();
  useTitulo(`Hoja de ruta #${id}`);
  const navigate = useNavigate();
  const { data: viaje, error, cargando, recargar } = useFetch(() => obtenerViaje(id), [id]);

  const [nuevaParada, setNuevaParada] = useState({ direccion_farmacia: '', cantidad_bultos: 1 });
  const [errorAccion, setErrorAccion] = useState('');
  const [editando, setEditando] = useState(false);
  const confirmar = useConfirmar();
  const avisar = useAvisos();

  if (cargando) return <Cargando />;
  if (error) return <Alerta>{error.message}</Alerta>;

  // La hoja de ruta solo se puede modificar mientras el camion no salio.
  const editable = viaje.EstadoViaje.descripcion === 'En Depósito';

  // Envuelve cada accion: limpia el error, la ejecuta y muestra el mensaje si falla.
  async function ejecutar(accion) {
    setErrorAccion('');
    try {
      await accion();
    } catch (err) {
      setErrorAccion(err.message);
    }
  }

  async function handleEliminarViaje() {
    const seguro = await confirmar({
      titulo: `¿Eliminar la hoja de ruta #${viaje.id}?`,
      mensaje: 'El vehículo y el conductor quedan libres para otro viaje.',
      textoConfirmar: 'Eliminar',
      peligro: true,
    });
    if (!seguro) return;
    ejecutar(async () => {
      await eliminarViaje(viaje.id);
      avisar(`Hoja de ruta #${viaje.id} eliminada.`);
      navigate('/viajes');
    });
  }

  function handleQuitarDestino(destino) {
    ejecutar(async () => {
      await eliminarDestino(viaje.id, destino.id);
      recargar();
    });
  }

  function handleAgregarDestino(e) {
    e.preventDefault();
    ejecutar(async () => {
      await agregarDestino(viaje.id, { ...nuevaParada, cantidad_bultos: Number(nuevaParada.cantidad_bultos) });
      setNuevaParada({ direccion_farmacia: '', cantidad_bultos: 1 });
      recargar();
    });
  }

  return (
    <>
      <div className="encabezado">
        <h1>
          Hoja de ruta #{viaje.id} <Badge estado={viaje.EstadoViaje.descripcion} />
        </h1>
        <div className="acciones no-imprimir">
          <Link to="/viajes" className="btn btn-secundario">
            Volver
          </Link>
          <button className="btn btn-secundario" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" />
            Imprimir
          </button>
          {editable && !editando && (
            <button className="btn btn-secundario" onClick={() => setEditando(true)}>
              <Pencil size={18} aria-hidden="true" />
              Editar
            </button>
          )}
          {editable && (
            <button className="btn btn-peligro" onClick={handleEliminarViaje}>
              Eliminar
            </button>
          )}
        </div>
      </div>

      <Alerta>{errorAccion}</Alerta>

      <div className="card">
        <LineaEstados viaje={viaje} />
      </div>

      {editando && (
        <EditarAsignacion
          viaje={viaje}
          alCancelar={() => setEditando(false)}
          alGuardar={() => {
            setEditando(false);
            avisar(`Hoja de ruta #${viaje.id} actualizada.`);
            recargar();
          }}
        />
      )}

      <div className="card datos">
        <Dato etiqueta="Vehículo">
          {descripcionVehiculo(viaje.Vehiculo)}
          {viaje.Vehiculo?.fecha_eliminacion && <DeBaja />}
        </Dato>
        <Dato etiqueta="Conductor">
          {nombreConductor(viaje.Conductor)}
          {viaje.Conductor?.fecha_eliminacion && <DeBaja />}
        </Dato>
        <Dato etiqueta="Creado">{formatearFechaHora(viaje.fecha_creacion)}</Dato>
        <Dato etiqueta="Salida">
          {viaje.fecha_salida && `${formatearFechaHora(viaje.fecha_salida)} · ${viaje.km_salida} km`}
        </Dato>
        <Dato etiqueta="Regreso">
          {viaje.fecha_regreso && `${formatearFechaHora(viaje.fecha_regreso)} · ${viaje.km_regreso} km`}
        </Dato>
        <Dato etiqueta="Km recorridos">{viaje.km_recorridos}</Dato>
      </div>

      <div className="card">
        <h2>Destinos</h2>
        <ListaDestinos
          destinos={viaje.Destinos}
          acciones={
            // Solo en deposito, y nunca el ultimo (un viaje necesita al menos un destino).
            editable && viaje.Destinos.length > 1
              ? (d) => (
                  <button className="btn btn-secundario btn-chico" onClick={() => handleQuitarDestino(d)}>
                    Quitar
                  </button>
                )
              : undefined
          }
        />

        {editable && (
          <form className="parada-form no-imprimir" onSubmit={handleAgregarDestino} style={{ marginTop: '1rem' }}>
            <Campo
              label="Nueva parada - Dirección"
              value={nuevaParada.direccion_farmacia}
              onChange={(e) => setNuevaParada({ ...nuevaParada, direccion_farmacia: e.target.value })}
              placeholder="Ej: Farmacia Norte - Calle 13 N° 845, La Plata"
              maxLength={200}
              required
            />
            <Campo
              label="Bultos"
              type="number"
              min="1"
              max="1000"
              value={nuevaParada.cantidad_bultos}
              onChange={(e) => setNuevaParada({ ...nuevaParada, cantidad_bultos: e.target.value })}
              required
            />
            <button className="btn">+ Añadir</button>
          </form>
        )}
      </div>

      {/* Solo en papel: espacio para firmar al salir y al volver */}
      <div className="solo-imprimir firmas">
        <div>Firma del conductor</div>
        <div>Firma del responsable de depósito</div>
      </div>
    </>
  );
}

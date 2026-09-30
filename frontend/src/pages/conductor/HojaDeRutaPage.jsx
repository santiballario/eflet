import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useFetch } from '@/hooks/use-fetch';
import { obtenerViaje, registrarEntrega, registrarRegreso, registrarSalida } from '@/services/viajes';
import { listarMotivosNoEntrega } from '@/services/catalogos';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Campo } from '@/components/ui/Campo';
import { Cargando } from '@/components/ui/Cargando';
import { ListaDestinos } from '@/components/ListaDestinos';
import { descripcionVehiculo } from '@/utils/formato';

// Flujo del conductor segun el estado del viaje:
//   En Deposito -> carga km y registra la SALIDA
//   En Viaje    -> marca cada parada Entregado / No entregado (con motivo)
//   Entregado   -> carga km y registra el REGRESO
//   Finalizado  -> resumen
export function HojaDeRutaPage() {
  const { id } = useParams();
  // setData: cada accion del backend devuelve el viaje actualizado, asi que lo
  // reemplazamos directo sin volver a pedirlo.
  const { data: viaje, error, cargando, setData: setViaje } = useFetch(() => obtenerViaje(id), [id]);
  const { data: motivos } = useFetch(listarMotivosNoEntrega);

  const [km, setKm] = useState('');
  const [noEntregado, setNoEntregado] = useState(null); // destino que se esta marcando como "No entregado"
  const [motivoId, setMotivoId] = useState('');
  const [errorAccion, setErrorAccion] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (cargando) return <Cargando />;
  if (error) return <Alerta>{error.message}</Alerta>;

  const estado = viaje.EstadoViaje.descripcion;

  async function ejecutar(accion) {
    setErrorAccion('');
    setEnviando(true);
    try {
      setViaje(await accion());
      setKm('');
      setNoEntregado(null);
      setMotivoId('');
    } catch (err) {
      // ej: 409 "El km de salida no puede ser menor al ultimo km de regreso"
      setErrorAccion(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function handleSalida(e) {
    e.preventDefault();
    ejecutar(() => registrarSalida(viaje.id, Number(km)));
  }

  function handleRegreso(e) {
    e.preventDefault();
    ejecutar(() => registrarRegreso(viaje.id, Number(km)));
  }

  function handleNoEntregado(e) {
    e.preventDefault();
    ejecutar(() => registrarEntrega(viaje.id, noEntregado.id, 'No entregado', Number(motivoId)));
  }

  // Botones grandes de cada parada pendiente (solo mientras el viaje esta En Viaje).
  function accionesParada(destino) {
    if (estado !== 'En Viaje' || destino.estado_entrega !== 'Pendiente') return null;

    if (noEntregado?.id === destino.id) {
      return (
        <form className="formulario" onSubmit={handleNoEntregado}>
          <Campo label="Motivo" as="select" value={motivoId} onChange={(e) => setMotivoId(e.target.value)} required>
            <option value="">Seleccionar motivo...</option>
            {motivos?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.descripcion}
              </option>
            ))}
          </Campo>
          <div className="acciones">
            <button type="button" className="btn btn-secundario" onClick={() => setNoEntregado(null)}>
              Cancelar
            </button>
            <button className="btn btn-peligro" disabled={enviando}>
              Confirmar no entregado
            </button>
          </div>
        </form>
      );
    }

    return (
      <div className="fila" style={{ gap: '0.5rem' }}>
        <button
          className="btn btn-exito btn-grande"
          disabled={enviando}
          onClick={() => ejecutar(() => registrarEntrega(viaje.id, destino.id, 'Entregado'))}
        >
          ✓ Entregado
        </button>
        <button className="btn btn-peligro btn-grande" disabled={enviando} onClick={() => setNoEntregado(destino)}>
          ✕ No entregado
        </button>
      </div>
    );
  }

  return (
    <>
      <Link to="/mis-viajes" className="chico">
        ← Mis hojas de ruta
      </Link>
      <div className="encabezado" style={{ marginTop: '0.5rem' }}>
        <h1>Hoja de ruta #{viaje.id}</h1>
        <Badge estado={estado} />
      </div>
      <p className="texto-suave">{descripcionVehiculo(viaje.Vehiculo)}</p>

      <Alerta>{errorAccion}</Alerta>

      {estado === 'En Depósito' && (
        <form className="card formulario" onSubmit={handleSalida}>
          <h2>Registrar salida</h2>
          <Campo
            label="Kilometraje actual del vehículo"
            type="number"
            inputMode="numeric"
            min="0"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            required
          />
          <button className="btn btn-grande" disabled={enviando}>
            Iniciar viaje
          </button>
        </form>
      )}

      {estado === 'Entregado' && (
        <form className="card formulario" onSubmit={handleRegreso}>
          <h2>Registrar regreso</h2>
          <p className="chico texto-suave">Salida: {viaje.km_salida} km</p>
          <Campo
            label="Kilometraje al volver"
            type="number"
            inputMode="numeric"
            min={viaje.km_salida ?? 0}
            value={km}
            onChange={(e) => setKm(e.target.value)}
            required
          />
          <button className="btn btn-grande" disabled={enviando}>
            Finalizar viaje
          </button>
        </form>
      )}

      {estado === 'Finalizado' && (
        <Alerta tipo="exito">
          Viaje finalizado. Recorriste {viaje.km_recorridos} km ({viaje.km_salida} → {viaje.km_regreso}).
        </Alerta>
      )}

      <div className="card">
        <h2>Paradas</h2>
        <ListaDestinos destinos={viaje.Destinos} acciones={accionesParada} />
      </div>
    </>
  );
}

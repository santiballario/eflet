import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { actualizarVehiculo, crearVehiculo, obtenerVehiculo } from '@/services/vehiculos';
import { Alerta } from '@/components/ui/Alerta';
import { Campo } from '@/components/ui/Campo';
import { Cargando } from '@/components/ui/Cargando';

const VACIO = {
  patente: '',
  marca: '',
  modelo: '',
  cantidad_maxima: '',
  vencimiento_vtv: '',
  estado: 'Activo',
};

// Un solo formulario para crear (/vehiculos/nuevo) y editar (/vehiculos/:id/editar).
export function VehiculoFormPage() {
  const { id } = useParams(); // undefined cuando es "nuevo"
  const esEdicion = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(VACIO);
  const [cargando, setCargando] = useState(esEdicion);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Si es edicion, traemos el vehiculo para completar el formulario.
  useEffect(() => {
    if (!esEdicion) return;
    obtenerVehiculo(id)
      .then((v) =>
        setForm({
          patente: v.patente,
          marca: v.marca,
          modelo: v.modelo,
          cantidad_maxima: Number(v.cantidad_maxima),
          vencimiento_vtv: v.vencimiento_vtv,
          estado: v.estado,
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id, esEdicion]);

  // Un solo handler para todos los inputs: usa el atributo "name" como clave.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    const datos = { ...form, cantidad_maxima: Number(form.cantidad_maxima) };
    try {
      if (esEdicion) await actualizarVehiculo(id, datos);
      else await crearVehiculo(datos);
      navigate('/vehiculos');
    } catch (err) {
      // 400 (dato invalido) o 409 (patente repetida): mostramos el mensaje del backend
      setError(err.message);
      setEnviando(false);
    }
  }

  if (cargando) return <Cargando />;

  return (
    <>
      <h1>{esEdicion ? 'Editar vehículo' : 'Nuevo vehículo'}</h1>
      <form className="card formulario" onSubmit={handleSubmit}>
        <Alerta>{error}</Alerta>

        <div className="fila">
          <Campo label="Patente" name="patente" value={form.patente} onChange={handleChange} maxLength={10} required />
          <Campo label="Marca" name="marca" value={form.marca} onChange={handleChange} required />
          <Campo label="Modelo" name="modelo" value={form.modelo} onChange={handleChange} required />
        </div>
        <div className="fila">
          <Campo
            label="Capacidad máxima (kg)"
            name="cantidad_maxima"
            type="number"
            min="0.01"
            step="0.01"
            value={form.cantidad_maxima}
            onChange={handleChange}
            required
          />
          <Campo
            label="Vencimiento VTV"
            name="vencimiento_vtv"
            type="date"
            value={form.vencimiento_vtv}
            onChange={handleChange}
            required
          />
          <Campo label="Estado" as="select" name="estado" value={form.estado} onChange={handleChange}>
            <option>Activo</option>
            <option>En mantenimiento</option>
            <option>Baja</option>
          </Campo>
        </div>

        <div className="acciones">
          <Link to="/vehiculos" className="btn btn-secundario">
            Cancelar
          </Link>
          <button className="btn" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </>
  );
}

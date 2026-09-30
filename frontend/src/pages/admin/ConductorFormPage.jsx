import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { actualizarConductor, crearConductor, obtenerConductor } from '@/services/conductores';
import { Alerta } from '@/components/ui/Alerta';
import { Campo } from '@/components/ui/Campo';
import { Cargando } from '@/components/ui/Cargando';

const VACIO = {
  email: '',
  password: '',
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  nro_licencia: '',
  vencimiento_licencia: '',
  disponibilidad: 'Disponible',
};

// Crear: se cargan los datos de login (email y contrasena) + persona + licencia.
// Editar: el backend no deja cambiar email, contrasena ni DNI, asi que no se muestran.
export function ConductorFormPage() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(VACIO);
  const [cargando, setCargando] = useState(esEdicion);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!esEdicion) return;
    obtenerConductor(id)
      .then((c) =>
        setForm({
          ...VACIO,
          email: c.Usuario.email,
          nombre: c.Usuario.Persona.nombre,
          apellido: c.Usuario.Persona.apellido,
          dni: c.Usuario.Persona.dni,
          telefono: c.Usuario.Persona.telefono,
          nro_licencia: c.nro_licencia,
          vencimiento_licencia: c.vencimiento_licencia,
          disponibilidad: c.disponibilidad,
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id, esEdicion]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      if (esEdicion) {
        const { nombre, apellido, telefono, nro_licencia, vencimiento_licencia, disponibilidad } = form;
        await actualizarConductor(id, { nombre, apellido, telefono, nro_licencia, vencimiento_licencia, disponibilidad });
      } else {
        // eslint-disable-next-line no-unused-vars -- la disponibilidad inicial la pone el backend
        const { disponibilidad, ...datos } = form;
        await crearConductor(datos);
      }
      navigate('/conductores');
    } catch (err) {
      setError(err.message); // ej: 409 "Ya existe un registro con esos datos."
      setEnviando(false);
    }
  }

  if (cargando) return <Cargando />;

  return (
    <>
      <h1>{esEdicion ? 'Editar conductor' : 'Nuevo conductor'}</h1>
      <form className="card formulario" onSubmit={handleSubmit}>
        <Alerta>{error}</Alerta>

        <h2>Datos personales</h2>
        <div className="fila">
          <Campo label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <Campo label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
          <Campo label="DNI" name="dni" value={form.dni} onChange={handleChange} required disabled={esEdicion} />
          <Campo label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} required />
        </div>

        <h2>Licencia</h2>
        <div className="fila">
          <Campo label="Nro. de licencia" name="nro_licencia" value={form.nro_licencia} onChange={handleChange} required />
          <Campo
            label="Vencimiento"
            name="vencimiento_licencia"
            type="date"
            value={form.vencimiento_licencia}
            onChange={handleChange}
            required
          />
          {esEdicion && (
            <Campo label="Disponibilidad" as="select" name="disponibilidad" value={form.disponibilidad} onChange={handleChange}>
              <option>Disponible</option>
              <option>No disponible</option>
              {/* "En viaje" lo maneja el sistema al registrar salida/regreso */}
              {form.disponibilidad === 'En viaje' && <option>En viaje</option>}
            </Campo>
          )}
        </div>

        <h2>Acceso al sistema</h2>
        <div className="fila">
          <Campo
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={esEdicion}
          />
          {!esEdicion && (
            <Campo
              label="Contraseña inicial"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={form.password}
              onChange={handleChange}
              required
            />
          )}
        </div>

        <div className="acciones">
          <Link to="/conductores" className="btn btn-secundario">
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

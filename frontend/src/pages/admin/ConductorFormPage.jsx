import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { actualizarConductor, crearConductor, obtenerConductor } from '@/services/conductores';
import { Alerta } from '@/components/ui/Alerta';
import { Campo } from '@/components/ui/Campo';
import { Cargando } from '@/components/ui/Cargando';
import { Eye, EyeOff } from 'lucide-react';
import { useTitulo } from '@/hooks/use-titulo';
import { useAvisos } from '@/components/ui/avisos-context';

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

export function ConductorFormPage() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const avisar = useAvisos();
  useTitulo(esEdicion ? 'Editar conductor' : 'Nuevo conductor');
  const navigate = useNavigate();

  const [form, setForm] = useState(VACIO);
  const [cargando, setCargando] = useState(esEdicion);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

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
        const datosEnvio = { ...form };
        delete datosEnvio.disponibilidad;
        await crearConductor(datosEnvio);
      }
      avisar(esEdicion ? 'Cambios guardados.' : `Conductor ${form.nombre} ${form.apellido} dado de alta.`);
      navigate('/conductores');
    } catch (err) {
      setError(err.message);
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
          <Campo label="Nombre" name="nombre" placeholder="Ej: Juan" value={form.nombre} onChange={handleChange} required />
          <Campo label="Apellido" name="apellido" placeholder="Ej: Perez"  value={form.apellido} onChange={handleChange} required />
          <Campo label="DNI" name="dni" placeholder="Ej: 31734383" value={form.dni} onChange={handleChange} required disabled={esEdicion} />
          <Campo label="Teléfono" name="telefono" placeholder="Ej: 2213468374" value={form.telefono} onChange={handleChange} required />
        </div>

        <h2>Licencia</h2>
        <div className="fila">
          <Campo label="Nro. de licencia" name="nro_licencia" placeholder="Ej: 123456" value={form.nro_licencia} onChange={handleChange} required />
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
              {form.disponibilidad === 'En viaje' && <option>En viaje</option>}
            </Campo>
          )}
        </div>

        <h2>Acceso al sistema</h2>
        <div className="fila">
          <Campo
            label="Email"
            name="email"
            placeholder="Ej: persona@email.com"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={esEdicion}
          />
          {!esEdicion && (
            <div>
              <Campo
                label="Contraseña inicial"
                name="password"
                type={mostrarPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                value={form.password}
                onChange={handleChange}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-5px' }}>
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  style={{ background: 'none', border: 'none', color: '#3776B6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginTop: '5px', float: 'right' }}
                  title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>
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
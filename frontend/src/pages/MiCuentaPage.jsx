import { useState } from 'react';
import { LogOut, Pencil } from 'lucide-react';
import { actualizarPerfil, cambiarPassword, getMe } from '@/services/auth';
import { useAuth } from '@/auth/use-auth';
import { ROL } from '@/auth/roles';
import { useFetch } from '@/hooks/use-fetch';
import { Alerta } from '@/components/ui/Alerta';
import { Badge } from '@/components/ui/Badge';
import { Campo } from '@/components/ui/Campo';
import { Cargando } from '@/components/ui/Cargando';
import { diasHasta, formatearFecha, nombreCompleto } from '@/utils/formato';

// Pantalla "Mi cuenta" (admin y conductor):
//   - sus datos (solo lectura, salvo el telefono)
//   - cambio de contraseña
export function MiCuentaPage() {
  const { usuario, logout } = useAuth();
  const { data: perfil, error, cargando, setData: setPerfil } = useFetch(getMe);

  return (
    <>
      <div className="encabezado">
        <h1>Mi cuenta</h1>
        {/* Solo el admin en el celular: ahi no tiene el menu lateral para salir.
            (En la compu esta en el menu, y el conductor lo tiene siempre arriba.) */}
        {usuario.rol === ROL.ADMIN && (
          <button className="btn btn-secundario solo-celular" onClick={logout}>
            <LogOut size={18} aria-hidden="true" />
            Cerrar sesión
          </button>
        )}
      </div>

      <div className="cuenta">
        {cargando && <Cargando />}
        {error && <Alerta>{error.message}</Alerta>}
        {perfil && <MisDatos perfil={perfil} onActualizado={setPerfil} />}
        <CambiarPassword />
      </div>
    </>
  );
}

function Dato({ etiqueta, children }) {
  return (
    <div>
      <div className="etiqueta">{etiqueta}</div>
      <div>{children || '-'}</div>
    </div>
  );
}

function MisDatos({ perfil, onActualizado }) {
  const [editando, setEditando] = useState(false);
  const [telefono, setTelefono] = useState(perfil.telefono ?? '');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  const licencia = perfil.conductor;
  const diasLicencia = licencia ? diasHasta(licencia.vencimiento_licencia) : null;
  // El admin solo ve nombre, email y rol: su DNI y telefono no se usan en
  // ningun lado (existen porque todo Usuario tiene una Persona, ver el DER).
  const esConductor = perfil.rol === ROL.CONDUCTOR;

  async function guardarTelefono(e) {
    e.preventDefault();
    setError('');
    setExito('');
    setEnviando(true);
    try {
      onActualizado(await actualizarPerfil({ telefono }));
      setExito('Teléfono actualizado.');
      setEditando(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="card">
      <h2>Mis datos</h2>
      <Alerta>{error}</Alerta>
      <Alerta tipo="exito">{exito}</Alerta>

      <div className="datos">
        <Dato etiqueta="Nombre">{nombreCompleto(perfil)}</Dato>
        <Dato etiqueta="Email">{perfil.email}</Dato>
        {esConductor && <Dato etiqueta="DNI">{perfil.dni}</Dato>}
        <Dato etiqueta="Rol">{perfil.rol}</Dato>
      </div>

      {licencia && (
        <>
          <h3 className="subtitulo-seccion">Licencia de conducir</h3>
          <div className="datos">
            <Dato etiqueta="Número">{licencia.nro_licencia}</Dato>
            <Dato etiqueta="Vencimiento">
              {formatearFecha(licencia.vencimiento_licencia)}{' '}
              {diasLicencia < 0 && <span className="badge badge-error">Vencida</span>}
              {diasLicencia >= 0 && diasLicencia <= 30 && (
                <span className="badge badge-advertencia">Vence en {diasLicencia} días</span>
              )}
            </Dato>
            <Dato etiqueta="Disponibilidad">
              <Badge estado={licencia.disponibilidad} />
            </Dato>
          </div>
        </>
      )}

      {esConductor && (
        <>
          <h3 className="subtitulo-seccion">Contacto</h3>
          {editando ? (
            <form className="formulario" onSubmit={guardarTelefono}>
              <Campo
                label="Teléfono"
                type="tel"
                autoComplete="tel"
                placeholder="Ej: 221-4567890"
                maxLength={20}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                autoFocus
              />
              <div className="acciones">
                <button
                  type="button"
                  className="btn btn-secundario"
                  onClick={() => {
                    setEditando(false);
                    setTelefono(perfil.telefono ?? '');
                  }}
                >
                  Cancelar
                </button>
                <button className="btn" disabled={enviando}>
                  {enviando ? 'Guardando...' : 'Guardar teléfono'}
                </button>
              </div>
            </form>
          ) : (
            <div className="encabezado" style={{ marginBottom: 0 }}>
              <Dato etiqueta="Teléfono">{perfil.telefono}</Dato>
              <button className="btn btn-secundario btn-chico" onClick={() => setEditando(true)}>
                <Pencil size={14} aria-hidden="true" />
                Cambiar
              </button>
            </div>
          )}
          <p className="chico texto-suave" style={{ marginBottom: 0 }}>
            Para corregir otros datos, pedíselo al administrador.
          </p>
        </>
      )}
    </section>
  );
}

const PASSWORD_VACIO = { password_actual: '', password_nueva: '', confirmacion: '' };

// Sirve para reemplazar la contraseña inicial que le dio el admin.
function CambiarPassword() {
  const [form, setForm] = useState(PASSWORD_VACIO);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');

    // Esto se controla solo en el navegador: el backend recibe una sola vez
    // la contraseña nueva, la confirmacion es para evitar errores de tipeo.
    if (form.password_nueva !== form.confirmacion) {
      setError('La contraseña nueva y su confirmación no coinciden.');
      return;
    }

    setEnviando(true);
    try {
      const { mensaje } = await cambiarPassword(form);
      setExito(mensaje);
      setForm(PASSWORD_VACIO);
    } catch (err) {
      // ej: "La contraseña actual es incorrecta." / "Demasiados intentos..."
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card formulario" onSubmit={handleSubmit}>
      <h2>Cambiar contraseña</h2>
      <Alerta>{error}</Alerta>
      <Alerta tipo="exito">{exito}</Alerta>

      <Campo
        label="Contraseña actual"
        name="password_actual"
        type="password"
        autoComplete="current-password"
        value={form.password_actual}
        onChange={handleChange}
        required
      />
      <Campo
        label="Contraseña nueva (mínimo 8 caracteres)"
        name="password_nueva"
        type="password"
        autoComplete="new-password"
        minLength={8}
        value={form.password_nueva}
        onChange={handleChange}
        required
      />
      <Campo
        label="Repetir la contraseña nueva"
        name="confirmacion"
        type="password"
        autoComplete="new-password"
        minLength={8}
        value={form.confirmacion}
        onChange={handleChange}
        required
      />

      <div>
        <button className="btn" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  );
}

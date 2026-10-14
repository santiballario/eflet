import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { cambiarPassword } from '@/services/auth';
import { useAuth } from '@/auth/use-auth';
import { Alerta } from '@/components/ui/Alerta';
import { Campo } from '@/components/ui/Campo';

const VACIO = { password_actual: '', password_nueva: '', confirmacion: '' };

// Pantalla "Mi cuenta": cada usuario (admin o conductor) cambia su propia
// contraseña. Sirve para reemplazar la contraseña inicial que le dio el admin.
export function MiCuentaPage() {
  const { logout } = useAuth();
  const [form, setForm] = useState(VACIO);
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
      setForm(VACIO);
    } catch (err) {
      // ej: "La contraseña actual es incorrecta." / "Demasiados intentos..."
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="encabezado">
        <h1>Mi cuenta</h1>
        {/* En el celular el admin no tiene el menu lateral: sale desde aca */}
        <button className="btn btn-secundario" onClick={logout}>
          <LogOut size={18} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
      <form className="card formulario" onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
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
    </>
  );
}

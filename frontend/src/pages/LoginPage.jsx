import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/auth/use-auth';
import { inicioSegunRol } from '@/auth/roles';
import { Alerta } from '@/components/ui/Alerta';
import { Campo } from '@/components/ui/Campo';
import { Eye, EyeOff } from 'lucide-react';
import { useTitulo } from '@/hooks/use-titulo';

export function LoginPage() {
  useTitulo('Ingresar');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const usuario = await login(email, password);
      const destino = location.state?.from?.pathname ?? inicioSegunRol(usuario.rol);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-fondo">
      <form className="login-card formulario" onSubmit={handleSubmit}>
        <div>
          <div className="marca">
            <img src="/favicon.svg" alt="" width="36" height="36" />
            EFLET
          </div>
          <div className="subtitulo">Sistema de Control Logístico</div>
        </div>

        <Alerta>{error}</Alerta>

        <Campo
          label="Email"
          type="email"
          autoComplete="username"
          placeholder="nombre@eflet.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <Campo
          label="Contraseña"
          type={mostrarPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="button" className="ver-password" onClick={() => setMostrarPassword(!mostrarPassword)}>
          {mostrarPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          {mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        </button>

        <button className="btn btn-grande" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
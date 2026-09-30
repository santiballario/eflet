import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/auth/use-auth';
import { inicioSegunRol } from '@/auth/roles';
import { Alerta } from '@/components/ui/Alerta';
import { Campo } from '@/components/ui/Campo';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Formulario controlado: el valor de cada input vive en el estado de React.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); // evita que el navegador recargue la pagina
    setError('');
    setEnviando(true);
    try {
      const usuario = await login(email, password);
      // Si venia de una ruta protegida, lo devolvemos ahi; si no, a su inicio.
      const destino = location.state?.from?.pathname ?? inicioSegunRol(usuario.rol);
      navigate(destino, { replace: true });
    } catch (err) {
      // 401 -> "Email o contrasena incorrectos." / 429 -> demasiados intentos
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-fondo">
      <form className="login-card formulario" onSubmit={handleSubmit}>
        <div>
          <div className="marca">EFLET</div>
          <div className="subtitulo">Sistema de Control Logístico</div>
        </div>

        <Alerta>{error}</Alerta>

        <Campo
          label="Email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <Campo
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn btn-grande" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

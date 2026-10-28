import { Link } from 'react-router';
import { useTitulo } from '@/hooks/use-titulo';

export function NotFoundPage() {
  useTitulo('Página no encontrada');
  return (
    <div className="login-fondo">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div className="marca">404</div>
        <p className="subtitulo">La página que buscás no existe.</p>
        <Link to="/" className="btn">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

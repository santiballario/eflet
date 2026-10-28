import { useCallback, useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { AvisosContext } from './avisos-context';

const DURACION = 3500; // ms que queda visible cada aviso

// Avisos flotantes abajo a la derecha ("Vehículo guardado.") que se van solos.
// Viven arriba de las rutas, asi un aviso sigue visible aunque la pantalla
// cambie (por ejemplo, al guardar un formulario y volver a la lista).
export function AvisosProvider({ children }) {
  const [avisos, setAvisos] = useState([]);

  const avisar = useCallback((texto) => {
    const id = Date.now() + Math.random();
    setAvisos((actuales) => [...actuales, { id, texto }]);
    setTimeout(() => setAvisos((actuales) => actuales.filter((a) => a.id !== id)), DURACION);
  }, []);

  return (
    <AvisosContext value={avisar}>
      {children}
      {/* aria-live: los lectores de pantalla leen el aviso cuando aparece */}
      <div className="avisos" role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className="aviso">
            <CircleCheck size={18} aria-hidden="true" />
            {a.texto}
          </div>
        ))}
      </div>
    </AvisosContext>
  );
}

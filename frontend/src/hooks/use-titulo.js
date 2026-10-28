import { useEffect } from 'react';

// Titulo de la pestaña del navegador segun la pantalla: "Hojas de Ruta · eFlet".
// Mientras no hay pantalla (por ejemplo, verificando la sesion) queda "eFlet",
// igual que en index.html, asi el titulo no salta entre dos textos distintos.
export function useTitulo(texto) {
  useEffect(() => {
    document.title = texto ? `${texto} · eFlet` : 'eFlet';
  }, [texto]);
}

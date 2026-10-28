import { useEffect } from 'react';

// Titulo de la pestaña del navegador segun la pantalla: "Hojas de Ruta · eFlet".
export function useTitulo(texto) {
  useEffect(() => {
    document.title = texto ? `${texto} · eFlet` : 'eFlet - Sistema de Control Logístico';
  }, [texto]);
}

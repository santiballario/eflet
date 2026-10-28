import { createContext, use } from 'react';

// Contexto de los avisos flotantes (ver AvisosProvider.jsx).
export const AvisosContext = createContext(null);

// const avisar = useAvisos();
// avisar('Vehículo guardado.');
export function useAvisos() {
  return use(AvisosContext);
}

import { createContext, use } from 'react';

// Contexto del cartel de confirmacion (ver ConfirmarProvider.jsx).
export const ConfirmarContext = createContext(null);

// const confirmar = useConfirmar();
// if (await confirmar({ titulo: '¿Eliminar?', peligro: true })) { ... }
export function useConfirmar() {
  return use(ConfirmarContext);
}

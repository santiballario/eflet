// Pub-sub minimo para que api-client.js avise a auth-context.jsx que el token
// vencio (401), sin que los dos modulos se importen entre si.
const listeners = new Set();

export function onSessionExpired(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitSessionExpired() {
  for (const listener of listeners) listener();
}

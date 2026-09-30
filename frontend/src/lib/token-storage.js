// Guarda el JWT que devuelve POST /api/auth/login.
//
// Nuestro backend usa "Authorization: Bearer <token>" (no cookies httpOnly
// como el repo de clase), asi que el token tiene que quedar en el navegador
// para sobrevivir a un F5. Usamos sessionStorage: se borra al cerrar la
// pestana, y el token igual vence solo (JWT_EXPIRES_IN=8h en el backend).
// Contra XSS la defensa es no meter HTML crudo: React escapa todo lo que
// renderiza y en este proyecto nunca usamos dangerouslySetInnerHTML.
const KEY = 'eflet_token';

export function getToken() {
  return sessionStorage.getItem(KEY);
}

export function setToken(token) {
  sessionStorage.setItem(KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(KEY);
}

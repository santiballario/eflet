// Mismos valores que el campo "rol" del backend.
export const ROL = {
  ADMIN: 'Administrador',
  CONDUCTOR: 'Conductor',
};

// Pantalla de inicio de cada rol.
export function inicioSegunRol(rol) {
  return rol === ROL.CONDUCTOR ? '/mis-viajes' : '/';
}

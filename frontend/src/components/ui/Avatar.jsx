// Circulo con las iniciales de una persona ("MG" para Martin Gomez).
// El color sale del nombre, asi cada persona tiene siempre el mismo.
// Todos son fondos claros con texto oscuro de la misma familia (contraste 7:1 o mas).
const COLORES = [
  ['#dbeafe', '#1e40af'],
  ['#d1fae5', '#065f46'],
  ['#ede9fe', '#5b21b6'],
  ['#fef3c7', '#92400e'],
  ['#fce7f3', '#9d174d'],
];

export function Avatar({ nombre = '', apellido = '', chico = false }) {
  const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase() || '?';
  const suma = [...`${nombre}${apellido}`].reduce((total, letra) => total + letra.charCodeAt(0), 0);
  const [fondo, texto] = COLORES[suma % COLORES.length];

  return (
    <span className={`avatar${chico ? ' avatar-chico' : ''}`} style={{ background: fondo, color: texto }} aria-hidden="true">
      {iniciales}
    </span>
  );
}

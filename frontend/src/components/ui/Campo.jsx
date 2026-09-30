import { useId } from 'react';

// Label + control de formulario asociados (useId genera un id unico para htmlFor).
// `as` elige el control: 'input' (default) o 'select'.
// Todas las demas props (type, value, onChange, required...) van al control.
export function Campo({ label, as: Control = 'input', children, ...props }) {
  const id = useId();
  return (
    <div className="campo">
      <label htmlFor={id}>{label}</label>
      <Control id={id} {...props}>
        {children}
      </Control>
    </div>
  );
}

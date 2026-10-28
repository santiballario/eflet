import { useId, useState } from 'react';
import { CircleAlert } from 'lucide-react';

// Mensaje en castellano para cada regla de HTML que no se cumple
// (required, min, max, maxLength, type="email"...).
function mensajeDeError(control) {
  const v = control.validity;
  if (v.valueMissing) return control.tagName === 'SELECT' ? 'Elegí una opción.' : 'Completá este campo.';
  if (v.typeMismatch && control.type === 'email') return 'Ingresá un email válido, por ejemplo nombre@eflet.com.';
  if (v.badInput) return 'Ingresá un número.';
  if (v.rangeUnderflow) return `Tiene que ser ${control.min} o más.`;
  if (v.rangeOverflow) return `Tiene que ser ${control.max} o menos.`;
  if (v.stepMismatch) return 'Ingresá un número entero.';
  if (v.tooShort) return `Tiene que tener al menos ${control.minLength} caracteres.`;
  if (v.tooLong) return `Puede tener hasta ${control.maxLength} caracteres.`;
  return control.validationMessage;
}

// Label + control de formulario asociados (useId genera un id unico para htmlFor).
// `as` elige el control: 'input' (default), 'select' o 'textarea'.
// Todas las demas props (type, value, onChange, required...) van al control.
//
// Validacion: las reglas siguen siendo las de HTML (required, min, max...), pero
// en lugar del globito del navegador se muestra el mensaje debajo del campo, con
// el estilo de eFlet. El evento "invalid" lo dispara el navegador al enviar el form.
export function Campo({ label, as: Control = 'input', children, onChange, ...props }) {
  const id = useId();
  const [error, setError] = useState('');

  function handleInvalid(e) {
    e.preventDefault(); // sin el globito del navegador
    setError(mensajeDeError(e.target));
    // El foco va al primer campo con error del formulario
    if (e.target.form?.querySelector(':invalid') === e.target) e.target.focus();
  }

  function handleChange(e) {
    // Si ya habia un error, se borra apenas el dato pasa a ser valido
    if (error && e.target.checkValidity()) setError('');
    onChange?.(e);
  }

  return (
    <div className={`campo${error ? ' campo-con-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <Control
        id={id}
        onChange={handleChange}
        onInvalid={handleInvalid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </Control>
      {error && (
        <span id={`${id}-error`} className="campo-error">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}

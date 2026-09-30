// tipo: 'error' | 'exito' | 'advertencia'
export function Alerta({ tipo = 'error', children }) {
  if (!children) return null;
  return (
    <div className={`alerta alerta-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

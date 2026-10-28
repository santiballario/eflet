import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmarContext } from './confirmar-context';

// Cartel de confirmacion con el estilo de eFlet, en lugar del window.confirm
// del navegador. confirmar() devuelve una promesa: true si la persona acepta,
// false si cancela, aprieta Esc o hace clic afuera.
// Usa <dialog> de HTML: el navegador ya se encarga de dejarlo encima de todo,
// de que el foco quede adentro y de cerrarlo con Esc.
export function ConfirmarProvider({ children }) {
  const [pedido, setPedido] = useState(null); // { titulo, mensaje, textoConfirmar, peligro, resolver }
  const dialogo = useRef(null);

  const confirmar = useCallback(
    (opciones) => new Promise((resolver) => setPedido({ ...opciones, resolver })),
    []
  );

  useEffect(() => {
    if (pedido) dialogo.current?.showModal();
  }, [pedido]);

  function responder(valor) {
    pedido.resolver(valor);
    dialogo.current?.close();
    setPedido(null);
  }

  return (
    <ConfirmarContext value={confirmar}>
      {children}
      {pedido && (
        <dialog
          ref={dialogo}
          className="dialogo"
          aria-labelledby="dialogo-titulo"
          onCancel={(e) => {
            e.preventDefault(); // Esc: lo cerramos nosotros, para responder false
            responder(false);
          }}
          onClick={(e) => e.target === dialogo.current && responder(false)} // clic en el fondo oscuro
        >
          <h2 id="dialogo-titulo">{pedido.titulo}</h2>
          {pedido.mensaje && <p className="texto-suave">{pedido.mensaje}</p>}
          <div className="dialogo-acciones">
            <button type="button" className="btn btn-secundario" onClick={() => responder(false)} autoFocus>
              Cancelar
            </button>
            <button
              type="button"
              className={pedido.peligro ? 'btn btn-peligro' : 'btn'}
              onClick={() => responder(true)}
            >
              {pedido.textoConfirmar ?? 'Aceptar'}
            </button>
          </div>
        </dialog>
      )}
    </ConfirmarContext>
  );
}

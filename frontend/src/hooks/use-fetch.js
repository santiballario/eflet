import { useCallback, useEffect, useState } from 'react';

// Maneja los tres estados de un pedido a la API: cargando / error / exito.
// `pedido` es una funcion que devuelve una promesa (ej: () => listarVehiculos()).
// `recargar()` vuelve a pedir los datos (despues de crear, editar o borrar).
export function useFetch(pedido, dependencias = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [version, setVersion] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pedir = useCallback(pedido, dependencias);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    pedir()
      .then((resultado) => {
        if (!cancelado) setData(resultado);
      })
      .catch((err) => {
        if (!cancelado) setError(err);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    // Si el componente se desmonta (o cambian las dependencias) antes de que
    // llegue la respuesta, la ignoramos para no pisar datos mas nuevos.
    return () => {
      cancelado = true;
    };
  }, [pedir, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { data, error, cargando, recargar, setData };
}

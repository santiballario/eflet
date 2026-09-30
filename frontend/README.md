# eFlet — Frontend

Interfaz web de eFlet hecha con **React + Vite** (JavaScript). Consume la API del [backend](../backend/README.md).

## Puesta en marcha

Requisito: el backend corriendo en `http://localhost:3000` con `CORS_ORIGIN=http://localhost:5173` en `backend/.env`.

```bash
npm install
npm run dev          # http://localhost:5173
```

`.env` es opcional: solo hace falta si la API corre en otra dirección (ver `.env.example`).

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run lint` | Revisa el código con oxlint |

## Estructura

Misma organización que el repo de clase (`arcejf/clase-seguridad`), en JavaScript:

```
src/
├── main.jsx           punto de entrada: BrowserRouter + AuthProvider
├── App.jsx            todas las rutas (URL -> página) y qué rol puede entrar
├── index.css          estilos globales con la paleta del documento de diseño
├── auth/              sesión: contexto, hook useAuth, rutas protegidas por rol
├── lib/               cliente de la API (fetch + token), ApiError, guardado del token
├── services/          una función por endpoint, agrupadas por recurso
├── hooks/             useFetch: estados cargando / error / éxito
├── components/
│   ├── layout/        AdminLayout (sidebar / barra inferior) y ConductorLayout
│   ├── ui/            piezas reutilizables: Badge, Alerta, Campo, StatCard, Cargando
│   ├── TablaViajes    tabla de hojas de ruta (dashboard y listado)
│   └── ListaDestinos  paradas de un viaje (admin y conductor)
├── pages/
│   ├── LoginPage, NotFoundPage
│   ├── admin/         Panel de Control, Flota, Conductores, Hojas de Ruta
│   └── conductor/     Mis viajes y la hoja de ruta con salida / entregas / regreso
└── utils/formato.js   formateo de fechas y nombres
```

Flujo de un pedido: **página → service → lib/api-client → API**. Las páginas nunca llaman a `fetch` directamente.

## Pantallas

| Ruta | Rol | Pantalla |
|---|---|---|
| `/login` | público | Inicio de sesión |
| `/` | Admin | Panel de Control: vehículos activos, viajes en curso, entregas del día, VTV por vencer |
| `/viajes`, `/viajes/nuevo`, `/viajes/:id` | Admin | Hojas de ruta: listado con filtro, alta con paradas, detalle |
| `/vehiculos`, `/vehiculos/nuevo`, `/vehiculos/:id/editar` | Admin | CRUD de vehículos |
| `/conductores`, `/conductores/nuevo`, `/conductores/:id/editar` | Admin | CRUD de conductores |
| `/mis-viajes`, `/mis-viajes/:id` | Conductor | Sus viajes; registrar salida, entregas y regreso |

## Seguridad en el frontend

- El JWT se guarda en `sessionStorage` y viaja en `Authorization: Bearer`. Se borra al cerrar la pestaña o al cerrar sesión.
- Si la API responde **401** (token vencido), la app cierra la sesión sola y vuelve al login.
- `ProtectedRoute` impide entrar a pantallas de otro rol, pero **es solo comodidad**: la seguridad real la hace el backend (`requireAuth` + `requireRole`).
- React escapa todo lo que muestra; no se usa `dangerouslySetInnerHTML`, lo que evita XSS.
- Los formularios validan en el navegador (`required`, `min`, `maxLength`), pero el backend vuelve a validar todo y sus mensajes de error se muestran tal cual.

# eFlet — Backend

API REST de eFlet. Node.js + Express + Sequelize + MySQL 8, autenticación con JWT y roles **Administrador** / **Conductor**.

## Puesta en marcha

Requisitos: Node.js 20+ y MySQL 8 corriendo.

```bash
npm install
cp .env.example .env    # completar DB_USER, DB_PASSWORD y JWT_SECRET
npm run setup           # crea la base, corre las migraciones y carga los seeders
npm run dev             # API en http://localhost:3000
```

Usuario de prueba que crea el seeder: `admin@eflet.com` / `Admin123!`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta la API con recarga automática (nodemon) |
| `npm start` | Levanta la API |
| `npm run setup` | Crea la base (si no existe), aplica las migraciones pendientes y carga los seeders |
| `npm run db:migrate` | Aplica solo las migraciones pendientes |
| `npm run db:reset` | **Borra todo** y vuelve a crear las tablas y los datos iniciales |
| `npm test` | Corre los tests automáticos contra una base aparte (`DB_NAME_TEST`) |

## Arquitectura

Monolito en capas (ver documento de Persistencia). Cada pedido recorre:

```
routes/        → define la URL, el método HTTP y qué middlewares corren
middlewares/   → auth (JWT y rol), validate (resultado de express-validator), error-handler
domain/        → reglas de validación de forma (express-validator) y valores fijos del dominio
controllers/   → traducen HTTP <-> service (sin reglas de negocio)
services/      → reglas de negocio y transacciones
models/        → modelos Sequelize y relaciones (traducción del DER)
migrations/    → estructura de la base, versionada (sequelize-cli)
seeders/       → datos iniciales: catálogos y usuario admin
lib/           → utilidades: JWT, bcrypt, errores, filtro de campos
tests/         → tests automáticos (node:test + supertest)
```

## Formato de las respuestas

- Éxito: el recurso bajo su nombre, por ejemplo `{ "vehiculo": {...} }` o `{ "vehiculos": [...] }`.
- Error: siempre `{ "error": true, "mensaje": "...", "codigo": 409 }`.

| Código | Cuándo |
|---|---|
| 200 / 201 / 204 | OK / creado / eliminado |
| 400 | Datos inválidos |
| 401 | Falta el token, o es inválido o expiró |
| 403 | El rol no tiene permiso, o el viaje no es del conductor |
| 404 | No existe (o fue dado de baja) |
| 409 | Conflicto con una regla de negocio (duplicado, estado incorrecto, VTV vencida...) |
| 429 | Demasiados intentos (rate limit) |

## Endpoints

Todas las rutas empiezan con `/api` y, salvo `health` y `login`, requieren el header `Authorization: Bearer <token>`.

### Autenticación
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/health` | público | Estado de la API |
| POST | `/auth/login` | público | `{ email, password }` → `{ token, usuario }` (máx. 10 intentos cada 15 min) |
| GET | `/auth/me` | ambos | Datos del usuario del token |

### Vehículos
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/vehiculos` | ambos | Listar |
| GET | `/vehiculos/:id` | ambos | Obtener uno |
| POST | `/vehiculos` | Admin | Crear |
| PUT | `/vehiculos/:id` | Admin | Modificar |
| DELETE | `/vehiculos/:id` | Admin | Baja lógica (no si está en un viaje sin finalizar) |

### Conductores
Un conductor son tres tablas: Usuario (login) + Persona (datos personales) + Conductor (licencia).

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/conductores` | Admin | Listar |
| GET | `/conductores/:id` | Admin | Obtener uno |
| POST | `/conductores` | Admin | Crear (con su usuario para loguearse) |
| PUT | `/conductores/:id` | Admin | Modificar |
| DELETE | `/conductores/:id` | Admin | Baja lógica; pierde el acceso (no si está en un viaje sin finalizar) |

### Viajes (hojas de ruta) y destinos
Ciclo de vida: **En Depósito** → **En Viaje** → **Entregado** → **Finalizado**.

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/viajes?estado=&conductor_id=&vehiculo_id=` | ambos | Listar (el conductor ve solo los suyos) |
| GET | `/viajes/:id` | ambos | Hoja de ruta completa |
| POST | `/viajes` | Admin | Crear con `vehiculo_id`, `conductor_id` y `destinos: [...]` |
| PUT | `/viajes/:id` | Admin | Cambiar vehículo o conductor (solo En Depósito) |
| DELETE | `/viajes/:id` | Admin | Baja lógica (solo En Depósito) |
| POST | `/viajes/:id/destinos` | Admin | Agregar destino (solo En Depósito) |
| PUT | `/viajes/:id/destinos/:destinoId` | Admin | Modificar destino (solo En Depósito) |
| DELETE | `/viajes/:id/destinos/:destinoId` | Admin | Quitar destino (solo En Depósito, no el último) |
| POST | `/viajes/:id/salida` | Conductor | `{ km_salida }` → En Viaje |
| PATCH | `/viajes/:id/destinos/:destinoId/entrega` | Conductor | `{ estado_entrega, motivo_id? }` |
| POST | `/viajes/:id/regreso` | Conductor | `{ km_regreso }` → Finalizado |

### Catálogos
| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/estados-viaje` | ambos | Estados posibles de un viaje |
| GET | `/motivos-no-entrega` | ambos | Motivos para "No entregado" |

## Reglas de negocio

- No se asigna a un viaje un vehículo con **VTV vencida**, que no esté **Activo** o que ya esté en otro viaje sin finalizar.
- No se asigna un conductor con **licencia vencida**, que no esté **Disponible** o que ya tenga otro viaje sin finalizar.
- Al salir se vuelven a chequear la VTV y la licencia, porque pueden haber vencido desde que se armó el viaje.
- **Auditoría de kilometraje:** el km de salida no puede ser menor al último km de regreso del vehículo, y el de regreso no puede ser menor al de salida.
- "No entregado" exige un motivo. Cuando no queda ningún destino Pendiente, el viaje pasa a **Entregado** solo.
- El conductor queda "En viaje" al salir y vuelve a "Disponible" al regresar.
- `km_recorridos` es un atributo calculado: no se guarda en la base.
- Las bajas son **lógicas** (`fecha_eliminacion`): nada se borra físicamente.
- Nunca se guarda el body completo: cada service define qué campos acepta (protección contra *mass assignment*).

## Seguridad

- Contraseñas con **bcrypt** (12 rondas). El hash nunca se devuelve en las respuestas.
- **JWT** firmado con `JWT_SECRET`; lleva solo `id` y `rol`.
- **helmet** (cabeceras de seguridad), **CORS** limitado a `CORS_ORIGIN`, body de hasta 10 kb.
- **Rate limit**: 200 pedidos cada 15 minutos en toda la API, y 10 intentos de login cada 15 minutos.
- Login con **mensaje genérico**: no revela si el email existe.
- Los errores 500 se loguean en el servidor y al cliente le llega un mensaje genérico, sin stack trace.
- `.env` fuera de Git; `.env.example` documenta las variables.

## Probar la API

- **A mano:** `api.http`, con la extensión REST Client de VS Code. Trae todos los pedidos en orden, incluidos casos de error.
- **Automático:** `npm test` corre 52 tests (auth, vehículos, conductores y el ciclo completo de un viaje) contra la base de tests.

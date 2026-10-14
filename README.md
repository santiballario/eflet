# eFlet

Sistema de gestión de flota para logística farmacéutica: vehículos, conductores, hojas de ruta (viajes), destinos y motivos de no entrega.

Trabajo Grupal Integrador — Desarrollo de Software 2026, UTN FRLP, comisión S31.

**Integrantes:** Santiago Ballario, Stefano Diaz, Gianluca Baiza.

## Stack

| Parte | Tecnología |
|---|---|
| Backend | Node.js + Express |
| ORM | Sequelize |
| Base de datos | MySQL 8 |
| Autenticación | JWT (Bearer) + bcrypt, roles Administrador / Conductor |
| Frontend | React + Vite |
| Contenedores | Docker + docker-compose |

## Estructura

```
eflet/
├── backend/             API REST (Express + Sequelize)
├── frontend/            Interfaz web (React + Vite)
└── docker-compose.yml   Levanta MySQL, backend y frontend juntos
```

## Levantar con Docker (recomendado)

Requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) abierto. No hace falta instalar Node ni MySQL.

```bash
docker compose up --build -d
```

La primera vez tarda unos minutos (descarga las imágenes e instala las dependencias). Después abrir http://localhost:5173 y entrar con alguno de los [usuarios de prueba](#usuarios-y-datos-de-prueba).

Levanta tres contenedores:

| Servicio | Qué hace | Puerto |
|---|---|---|
| `db` | MySQL 8. Los datos se guardan en un volumen y sobreviven a los reinicios | — |
| `backend` | La API. Espera a que MySQL esté listo, aplica las migraciones y carga los seeders | 3000 |
| `frontend` | El frontend compilado, servido con nginx | 5173 |

| Para | Comando |
|---|---|
| Ver los mensajes del backend | `docker compose logs backend` |
| Apagar | `docker compose down` |
| Borrar la base y empezar de cero | `docker compose down -v` |

## Usuarios y datos de prueba

Los seeders cargan un administrador y datos de ejemplo para que la app no arranque vacía: 5 vehículos (uno con la VTV por vencer y otro en mantenimiento), 3 conductores y 5 viajes en distintos estados, con sus paradas. Las fechas se calculan a partir del día en que se crea la base.

| Usuario | Contraseña | Rol | Qué tiene |
|---|---|---|---|
| `admin@eflet.com` | `Admin123!` | Administrador | Acceso a todo |
| `martin.gomez@eflet.com` | `Conductor123!` | Conductor | Un viaje **En Viaje**, con paradas pendientes |
| `lucia.fernandez@eflet.com` | `Conductor123!` | Conductor | Un viaje **En Depósito**, listo para registrar la salida |
| `diego.sosa@eflet.com` | `Conductor123!` | Conductor | Solo viajes finalizados |

Los datos de ejemplo no se cargan en la base de los tests automáticos.

## Levantar sin Docker

### Requisitos

- Node.js 20 o superior
- MySQL 8 corriendo en local

### Backend

```bash
cd backend
npm install
cp .env.example .env     # completar DB_PASSWORD y JWT_SECRET
npm run setup            # crea la base, corre las migraciones y carga los datos iniciales
npm run dev              # API en http://localhost:3000
```

Verificar que funciona: `GET http://localhost:3000/api/health` debe responder `{ "ok": true }`.

Endpoints, reglas de negocio y cómo probar la API: ver [backend/README.md](backend/README.md).

### Frontend

Con el backend ya corriendo, en otra terminal:

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

En `backend/.env`, `CORS_ORIGIN` tiene que ser `http://localhost:5173`. Estructura y pantallas: ver [frontend/README.md](frontend/README.md).

## Flujo de trabajo con Git

1. `git fetch --prune` y `git pull origin main` antes de empezar.
2. Crear una rama por tarea: `git checkout -b feature/nombre-de-la-tarea`.
3. Commits chicos, con mensaje en imperativo presente (ej: "Agrega CRUD de viajes").
4. `git push -u origin feature/nombre-de-la-tarea` y abrir un Pull Request hacia `main`.
5. Nunca `git push --force` sobre `main`.

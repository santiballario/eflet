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

## Estructura

```
eflet/
├── backend/    API REST (Express + Sequelize)
└── frontend/   Interfaz web (React + Vite)
```

## Requisitos

- Node.js 20 o superior
- MySQL 8 corriendo en local

## Cómo levantar el backend

```bash
cd backend
npm install
cp .env.example .env     # completar DB_PASSWORD y JWT_SECRET
npm run setup            # crea la base, corre las migraciones y carga los datos iniciales
npm run dev              # API en http://localhost:3000
```

Verificar que funciona: `GET http://localhost:3000/api/health` debe responder `{ "ok": true }`.

Usuario de prueba: `admin@eflet.com` / `Admin123!`

Endpoints, reglas de negocio y cómo probar la API: ver [backend/README.md](backend/README.md).

## Cómo levantar el frontend

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

# Imagen del backend (API Node + Express)
# Tag especifico (no "latest") para que la imagen sea reproducible.
FROM node:22-slim

WORKDIR /app

# Primero solo las dependencias: si no cambian, Docker reutiliza esta capa
# y no vuelve a instalar todo en cada build.
COPY package*.json ./
RUN npm ci

# Despues el resto del codigo (sin node_modules ni .env: ver .dockerignore)
COPY . .

EXPOSE 3000

# Al arrancar: aplica las migraciones pendientes, carga los seeders que
# falten y levanta la API. Los seeders se registran en la base, asi que
# reiniciar el contenedor no duplica los datos.
CMD ["sh", "-c", "npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all && node server.js"]
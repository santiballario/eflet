# Imagen del frontend en dos etapas (multi-stage build):
#   1) "build": usa Node para compilar React a archivos estaticos (dist/)
#   2) nginx: sirve esos archivos. La imagen final no lleva Node ni el codigo fuente.

# ---------- Etapa 1: compilar ----------
FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Direccion de la API que va a usar el navegador. Queda fija dentro del JS
# compilado, por eso se pasa al construir la imagen y no al arrancarla.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Etapa 2: servir ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
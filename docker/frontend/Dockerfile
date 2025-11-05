# Dockerfile para Frontend React con TypeScript y Tailwind (funciona en desarrollo y producción)
FROM node:18-alpine

WORKDIR /app

# Argumento de build para determinar el modo
ARG NODE_ENV=development

# Copiar archivos de dependencias
COPY frontend/package*.json ./

# Instalar todas las dependencias
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY frontend/ .

# Exponer puerto (5173 para dev, 80 para prod con nginx)
EXPOSE 5173

# Variable de entorno
ENV NODE_ENV=${NODE_ENV}

# El comando se sobrescribe en docker-compose según el modo
# Por defecto ejecuta en modo desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


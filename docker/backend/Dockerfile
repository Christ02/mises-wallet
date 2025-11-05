# Dockerfile para Backend Node.js (funciona en desarrollo y producción)
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY backend/package*.json ./

# Instalar todas las dependencias (incluye devDependencies para desarrollo)
RUN npm install && npm cache clean --force

# Copiar código fuente
COPY backend/ .

# Exponer puerto (ajusta según tu configuración)
EXPOSE 3000

# Variable de entorno por defecto (se puede sobrescribir en docker-compose)
ENV NODE_ENV=development

# El comando se sobrescribe en docker-compose según el modo (dev o prod)


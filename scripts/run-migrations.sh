#!/bin/bash

# Script para ejecutar migraciones en producción
# Uso: ./scripts/run-migrations.sh

set -e  # Salir si hay algún error

echo "🚀 Ejecutando migraciones de base de datos..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# Verificar si Docker está corriendo
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    exit 1
fi

# Verificar si el contenedor backend existe
if ! docker ps -a --format '{{.Names}}' | grep -q "mises-wallet-backend"; then
    echo "⚠️  Advertencia: El contenedor backend no existe. Creando contenedores..."
    docker-compose up -d backend
    sleep 5
fi

# Ejecutar migraciones dentro del contenedor
echo "📦 Ejecutando migraciones en el contenedor backend..."
echo ""

docker exec mises-wallet-backend npm run migrate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migraciones ejecutadas exitosamente"
    exit 0
else
    echo ""
    echo "❌ Error al ejecutar migraciones"
    exit 1
fi


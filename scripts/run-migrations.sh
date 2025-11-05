#!/bin/bash

# Script para ejecutar todas las migraciones de la base de datos
# Uso: ./scripts/run-migrations.sh

set -e  # Detener si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de entorno (puedes cambiarlas)
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-mises-wallet-postgres}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-mises_wallet}"
MIGRATIONS_DIR="./database/migrations"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Mises Wallet - Migraciones${NC}"
echo -e "${BLUE}================================${NC}\n"

# Verificar que el contenedor esté corriendo
echo -e "${YELLOW}🔍 Verificando contenedor de PostgreSQL...${NC}"
if ! docker ps | grep -q $POSTGRES_CONTAINER; then
    echo -e "${RED}❌ Error: El contenedor '$POSTGRES_CONTAINER' no está corriendo${NC}"
    echo -e "${YELLOW}💡 Tip: Ejecuta 'docker-compose up -d' primero${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Contenedor activo${NC}\n"

# Verificar que existe el directorio de migraciones
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio de migraciones: $MIGRATIONS_DIR${NC}"
    exit 1
fi

# Contar migraciones
TOTAL_MIGRATIONS=$(find $MIGRATIONS_DIR -name "*.sql" | wc -l | tr -d ' ')
echo -e "${BLUE}📁 Migraciones encontradas: $TOTAL_MIGRATIONS${NC}\n"

if [ $TOTAL_MIGRATIONS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No se encontraron archivos .sql en $MIGRATIONS_DIR${NC}"
    exit 0
fi

# Ejecutar migraciones en orden
COUNTER=0
FAILED=0

for migration in $(find $MIGRATIONS_DIR -name "*.sql" | sort); do
    COUNTER=$((COUNTER + 1))
    MIGRATION_NAME=$(basename $migration)
    
    echo -e "${YELLOW}[$COUNTER/$TOTAL_MIGRATIONS]${NC} Ejecutando: ${BLUE}$MIGRATION_NAME${NC}"
    
    if docker exec -i $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d $POSTGRES_DB < $migration 2>&1 | grep -q "ERROR"; then
        echo -e "${RED}❌ Error en migración: $MIGRATION_NAME${NC}\n"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ Completada${NC}\n"
    fi
done

# Resumen final
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Resumen${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Total migraciones: ${BLUE}$TOTAL_MIGRATIONS${NC}"
echo -e "Exitosas: ${GREEN}$((TOTAL_MIGRATIONS - FAILED))${NC}"
echo -e "Fallidas: ${RED}$FAILED${NC}\n"

# Mostrar tablas creadas
echo -e "${YELLOW}📊 Tablas en la base de datos:${NC}"
docker exec -i $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d $POSTGRES_DB -c "\dt"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ¡Todas las migraciones se ejecutaron exitosamente!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Algunas migraciones fallaron. Revisa los errores arriba.${NC}"
    exit 1
fi


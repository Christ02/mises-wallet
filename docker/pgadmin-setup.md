# Configuración de pgAdmin

pgAdmin es una herramienta web para administrar y visualizar bases de datos PostgreSQL.

## Acceso

1. Una vez que los contenedores estén corriendo, accede a pgAdmin en:
   ```
   http://localhost:5051
   ```

2. Credenciales por defecto:
   - **Email**: `admin@mises-wallet.com`
   - **Password**: `admin`

## Configuración del Servidor PostgreSQL

Después de iniciar sesión, necesitas agregar el servidor PostgreSQL:

1. Click derecho en "Servers" → "Register" → "Server"

2. En la pestaña **General**:
   - **Name**: `Mises Wallet DB` (o cualquier nombre que prefieras)

3. En la pestaña **Connection**:
   - **Host name/address**: `postgres` (nombre del servicio en docker-compose)
   - **Port**: `5432` (puerto interno del contenedor, NO el puerto externo)
   - **Maintenance database**: `mises_wallet`
   - **Username**: `postgres` (o el valor de POSTGRES_USER en tu .env)
   - **Password**: `postgres` (o el valor de POSTGRES_PASSWORD en tu .env)
   - ✅ Marca "Save password" si quieres que se guarde

4. Click en "Save"

## Notas

- El host debe ser `postgres` (nombre del servicio en docker-compose), NO `localhost`
- El puerto debe ser `5432` (puerto interno del contenedor), NO `5433` (puerto externo)
- pgAdmin y PostgreSQL están en la misma red de Docker, por lo que se comunican internamente


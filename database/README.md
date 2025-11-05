# Base de Datos - Mises Wallet

## Migraciones

Las migraciones crean las tablas necesarias en la base de datos.

### Ejecutar Migraciones

Desde el contenedor de Docker:

```bash
docker exec -it mises-wallet-backend node /app/database/scripts/run-migrations.js
```

O desde el backend (si estás ejecutando localmente):

```bash
cd backend
npm run migrate
```

## Seeders

Los seeders crean datos iniciales en la base de datos.

### Ejecutar Seeder de Super Administrador

Desde el contenedor de Docker:

```bash
docker exec -it mises-wallet-backend node /app/database/scripts/run-seeder.js
```

O desde el backend:

```bash
cd backend
npm run seed
```

### Credenciales del Super Administrador

Después de ejecutar el seeder, se creará un usuario super administrador con:

- **Email**: `admin@ufm.edu`
- **Password**: `Admin123!`
- **Rol**: Super Administrador

⚠️ **IMPORTANTE**: Cambia la contraseña después del primer login en producción.

## Orden de Ejecución

1. Primero ejecuta las migraciones
2. Luego ejecuta el seeder

```bash
# 1. Migraciones
docker exec -it mises-wallet-backend node /app/database/scripts/run-migrations.js

# 2. Seeder
docker exec -it mises-wallet-backend node /app/database/scripts/run-seeder.js
```


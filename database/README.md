# 🗄️ Base de Datos - Mises Wallet

## Estructura

```
database/
├── migrations/         # Migraciones SQL (ejecutar en orden)
├── seeders/           # Datos iniciales
├── schemas/           # Esquemas y documentación
└── scripts/           # Scripts de utilidad
```

---

## 📋 Migraciones

Las migraciones se ejecutan en orden numérico automáticamente.

### ✅ Migraciones actuales:

1. `001_create_roles_table.sql` - Tabla de roles (super_admin, admin, usuario)
2. `002_create_users_table.sql` - Tabla de usuarios
3. `003_create_wallets_table.sql` - Tabla de wallets
4. `004_add_wallet_id_to_users.sql` - Relación usuario-wallet

---

## 🚀 Ejecutar Migraciones

### Método 1: Script automático (Recomendado)

```bash
# Desde la raíz del proyecto
./scripts/run-migrations.sh
```

### Método 2: Manual (migración por migración)

```bash
# Ejecutar una migración específica
docker exec -i mises-wallet-postgres psql -U postgres -d mises_wallet < database/migrations/001_create_roles_table.sql
```

---

## 🔍 Verificar Estado de la BD

```bash
# Ver todas las tablas
docker exec -i mises-wallet-postgres psql -U postgres -d mises_wallet -c "\dt"

# Ver estructura de una tabla
docker exec -i mises-wallet-postgres psql -U postgres -d mises_wallet -c "\d users"

# Ver datos de roles
docker exec -i mises-wallet-postgres psql -U postgres -d mises_wallet -c "SELECT * FROM roles;"

# Ver todos los usuarios
docker exec -i mises-wallet-postgres psql -U postgres -d mises_wallet -c "SELECT id, nombres, apellidos, email, carnet_universitario FROM users;"
```

---

## 🌱 Seeders

Los seeders insertan datos iniciales para desarrollo/testing.

```bash
# Ejecutar seeder de super admin
docker exec -i mises-wallet-postgres psql -U postgres -d mises_wallet < database/seeders/001_create_super_admin.sql
```

---

## 🗑️ Limpiar Base de Datos

```bash
# CUIDADO: Esto borra TODAS las tablas
docker exec -i mises-wallet-postgres psql -U postgres -d mises_wallet -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Después ejecuta las migraciones de nuevo
./scripts/run-migrations.sh
```

---

## 📦 Backup y Restore

### Backup

```bash
# Backup completo
docker exec -i mises-wallet-postgres pg_dump -U postgres mises_wallet > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup solo datos (sin estructura)
docker exec -i mises-wallet-postgres pg_dump -U postgres --data-only mises_wallet > data_backup.sql

# Backup solo estructura (sin datos)
docker exec -i mises-wallet-postgres pg_dump -U postgres --schema-only mises_wallet > schema_backup.sql
```

### Restore

```bash
# Restaurar desde backup
docker exec -i mises-wallet-postgres psql -U postgres -d mises_wallet < backup_20231105_120000.sql
```

---

## 🛠️ Troubleshooting

### El contenedor no está corriendo

```bash
docker-compose up -d
```

### Conectarse directamente a PostgreSQL

```bash
docker exec -it mises-wallet-postgres psql -U postgres -d mises_wallet
```

### Ver logs de PostgreSQL

```bash
docker logs mises-wallet-postgres
```

### Reiniciar base de datos

```bash
docker-compose restart postgres
```

---

## 📝 Crear una Nueva Migración

1. Crea un archivo con el siguiente formato:
   ```
   00X_descripcion_de_la_migracion.sql
   ```

2. Escribe el SQL:
   ```sql
   -- Migración: Descripción
   CREATE TABLE IF NOT EXISTS mi_tabla (
       id SERIAL PRIMARY KEY,
       nombre VARCHAR(100) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. Ejecuta las migraciones:
   ```bash
   ./scripts/run-migrations.sh
   ```

---

## ⚠️ Convenciones

- **Nombres de tablas:** minúsculas, plural (ej: `users`, `wallets`)
- **IDs:** `id SERIAL PRIMARY KEY`
- **Timestamps:** `created_at`, `updated_at`
- **Foreign keys:** `tabla_id` (ej: `user_id`, `role_id`)
- **Nombres de archivos:** `00X_descripcion.sql` (orden numérico)
- **Siempre usar:** `CREATE TABLE IF NOT EXISTS`

---

## 📊 Esquema Actual

```
roles
├── id (PK)
├── name (UNIQUE)
├── description
├── created_at
└── updated_at

users
├── id (PK)
├── nombres
├── apellidos
├── carnet_universitario (UNIQUE)
├── email (UNIQUE, @ufm.edu)
├── password_hash
├── role_id (FK → roles)
├── wallet_id (FK → wallets)
├── email_verified
├── reset_password_token
├── reset_password_expires
├── created_at
└── updated_at

wallets
├── id (PK)
├── address (UNIQUE)
├── encrypted_private_key
├── created_at
└── updated_at
```

---

## 🔗 Enlaces Útiles

- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker PostgreSQL](https://hub.docker.com/_/postgres)
- [pgAdmin](http://localhost:5051) - Interfaz gráfica local


# 🚀 Cómo Ejecutar Migraciones Manualmente en Railway

## Opción 1: Railway Dashboard (RECOMENDADO) ✅

### Pasos:

1. **Ve al proyecto en Railway:**
   - Abre: https://railway.app/project/mises-wallet-backend
   - O busca "mises-wallet-backend" en tu dashboard

2. **Selecciona el servicio:**
   - Click en el servicio **mises-wallet**

3. **Abre el Shell/Command:**
   - Ve a la pestaña **"Deployments"** o **"Logs"**
   - Busca el botón **"Run Command"** o **"Shell"** (ícono de terminal)
   - O ve directamente a: https://railway.app/project/mises-wallet-backend/service/mises-wallet

4. **Ejecuta el comando:**
   ```bash
   npm run migrate
   ```

5. **Verifica el resultado:**
   - Deberías ver mensajes como:
     - ✅ Tabla de tracking de migraciones creada/verificada
     - 🔄 Ejecutando: 001_create_roles_table.sql
     - ✅ Completada en Xms
     - 📊 Resumen: Ejecutadas: 20, Errores: 0

---

## Opción 2: Desde el código (Automático)

Las migraciones se ejecutarán automáticamente cuando:
- El servicio se reinicie
- Se haga un nuevo deploy
- El contenedor se inicie

Esto es porque el script `start` en `package.json` ejecuta:
```json
"start": "npm run migrate && node src/index.js"
```

---

## Opción 3: Verificar si las migraciones ya se ejecutaron

Si quieres verificar si las tablas ya existen, puedes ejecutar en el Shell de Railway:

```bash
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name\").then(r => { console.log('📊 Tablas:'); r.rows.forEach(row => console.log('  -', row.table_name)); pool.end(); });"
```

---

## ⚠️ Nota Importante

El comando `railway run npm run migrate` **NO funciona** porque ejecuta el comando localmente, no dentro del contenedor de Railway. Por eso no puede acceder a `postgres.railway.internal`.

**Siempre usa el Dashboard de Railway para ejecutar comandos dentro del contenedor.**

---

## 📋 Comandos Útiles

- **Ver logs del servicio:**
  ```bash
  railway logs --service mises-wallet
  ```

- **Ver variables de entorno:**
  ```bash
  railway variables
  ```

- **Reiniciar el servicio (ejecutará migraciones automáticamente):**
  - Desde el Dashboard: Click en "Restart" o "Redeploy"


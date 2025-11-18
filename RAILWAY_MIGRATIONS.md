# 🚀 Ejecutar Migraciones en Railway

## Opción 1: Desde Railway Dashboard (RECOMENDADO)

1. Ve a: https://railway.app/project/mises-wallet-backend
2. Click en el servicio **mises-wallet**
3. Ve a la pestaña **"Deployments"** o **"Logs"**
4. Click en **"Run Command"** o **"Shell"**
5. Ejecuta: `npm run migrate`

## Opción 2: Desde Railway CLI (Requiere ejecutar dentro del contenedor)

El comando `railway run` ejecuta localmente, por lo que no puede acceder a `postgres.railway.internal`.

Para ejecutar dentro del contenedor, usa Railway's web interface o agrega el comando al proceso de deploy.

## Opción 3: Agregar al proceso de deploy

Puedes modificar el `package.json` para ejecutar migraciones automáticamente después del deploy:

```json
{
  "scripts": {
    "start": "npm run migrate && node src/index.js"
  }
}
```

**Nota:** Esto ejecutará las migraciones en cada deploy, pero el script es idempotente (solo ejecuta migraciones pendientes).

---

**La forma más rápida es usar el Dashboard de Railway y ejecutar `npm run migrate` desde allí.**


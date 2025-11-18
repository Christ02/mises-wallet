# 🔧 Fix para Railway Build Error

## ❌ Problema Identificado

Railway no puede detectar que es una app Node.js porque está analizando la raíz del proyecto en lugar del directorio `backend`.

## ✅ Solución

### 1. Configurar Root Directory en Railway Dashboard

**IMPORTANTE**: Debes hacer esto manualmente:

1. Ve a: https://railway.com/project/24fa5fe6-ee5d-49cc-b9bb-a8bcba57dbf7
2. Click en el servicio `mises-wallet`
3. Ve a **Settings** → **Service**
4. En **Root Directory**, escribe: `backend`
5. Guarda los cambios

Esto le dice a Railway que el código de la aplicación está en la carpeta `backend/`.

### 2. Variables de Entorno Configuradas

Ya configuré estas variables básicas:
- ✅ `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- ✅ `NODE_ENV=production`
- ✅ `PORT=3000`

### 3. Variables Adicionales Necesarias

Agrega estas variables en Railway Dashboard → Variables del servicio `mises-wallet`:

```env
# JWT
JWT_SECRET=tu-jwt-secret-super-seguro-aqui-cambiar-en-produccion

# Encriptación para wallets
ENCRYPTION_KEY=tu-encryption-key-de-32-caracteres-exactos

# Sepolia Testnet RPC
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/tu-api-key

# Frontend URL (actualizar cuando tengas el dominio de Vercel)
FRONTEND_URL=https://tu-frontend.vercel.app

# CORS (actualizar cuando tengas el dominio de Vercel)
CORS_ORIGIN=https://tu-frontend.vercel.app

# Email Configuration
EMAIL_PROVIDER=resend
RESEND_API_KEY=tu-resend-api-key
RESEND_FROM_EMAIL=noreply@tu-dominio.com

# O si usas Mailtrap para testing:
# EMAIL_PROVIDER=mailtrap
# SMTP_HOST=sandbox.smtp.mailtrap.io
# SMTP_PORT=2525
# SMTP_SECURE=false
# SMTP_USER=tu-mailtrap-user
# SMTP_PASS=tu-mailtrap-pass
# SMTP_FROM_EMAIL=noreply@tu-dominio.com
# SMTP_FROM_NAME=Mises Wallet

# Central Wallet (si aplica)
CENTRAL_WALLET_ADDRESS=tu-direccion-wallet
CENTRAL_WALLET_PRIVATE_KEY=tu-private-key-encriptada

# Currency Rate
CURRENCY_RATE_GTQ=1
```

### 4. Archivos de Configuración Actualizados

- ✅ `backend/nixpacks.toml` - Configuración de build para el directorio backend
- ✅ `railway.json` - Actualizado para usar `npm start` directamente
- ✅ Variables básicas configuradas

### 5. Después de Configurar Root Directory

1. Railway detectará automáticamente Node.js
2. Ejecutará `npm ci` en el directorio `backend/`
3. Ejecutará `npm start` para iniciar el servidor
4. El build debería funcionar correctamente

### 6. Ejecutar Migraciones

Después de que el servicio esté corriendo:

```bash
railway run npm run migrate
```

O desde Railway Dashboard:
- Settings → Deploy → Add Deploy Hook
- Command: `npm run migrate`

---

## ✅ Checklist

- [ ] Root Directory configurado a `backend` en Railway Dashboard
- [ ] Variables de entorno básicas configuradas (ya hecho)
- [ ] Variables adicionales agregadas (JWT_SECRET, etc.)
- [ ] Build exitoso
- [ ] Servicio corriendo
- [ ] Migraciones ejecutadas
- [ ] Health check funcionando

---

## 🚀 Próximos Pasos

1. **Configurar Root Directory** (manual, paso crítico)
2. **Agregar variables de entorno** faltantes
3. **Hacer redeploy** o esperar a que Railway detecte los cambios
4. **Verificar logs** para asegurar que todo funciona
5. **Ejecutar migraciones**

---

¡Después de configurar el Root Directory, el build debería funcionar! 🎉


# 🚂 Railway Setup - Mises Wallet Backend

## ✅ Estado Actual

- ✅ Proyecto creado: `mises-wallet-backend`
- ✅ PostgreSQL desplegado y funcionando
- ⏳ Servicio backend pendiente de crear

## 📋 Próximos Pasos Manuales

### 1. Crear Servicio Backend en Railway Dashboard

1. Ve a: https://railway.com/project/24fa5fe6-ee5d-49cc-b9bb-a8bcba57dbf7
2. Click en "New" → "Empty Service"
3. Nombre: `backend`
4. Conecta tu repositorio Git o sube el código

### 2. Configurar Variables de Entorno

En Railway Dashboard → Variables del servicio `backend`, agregar:

```env
# Base de datos (referencia al servicio Postgres)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Node
NODE_ENV=production
PORT=3000

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro-aqui

# Encriptación para wallets
ENCRYPTION_KEY=tu-encryption-key-de-32-caracteres

# Sepolia Testnet RPC
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/tu-api-key

# Frontend URL (para password reset links)
FRONTEND_URL=https://tu-frontend.vercel.app

# Email Configuration
EMAIL_PROVIDER=resend
RESEND_API_KEY=tu-resend-api-key
RESEND_FROM_EMAIL=noreply@tu-dominio.com

# CORS (URL del frontend en Vercel)
CORS_ORIGIN=https://tu-frontend.vercel.app

# Central Wallet (si aplica)
CENTRAL_WALLET_ADDRESS=tu-direccion-wallet
CENTRAL_WALLET_PRIVATE_KEY=tu-private-key-encriptada

# Currency Rate
CURRENCY_RATE_GTQ=1
```

### 3. Configurar Root Directory

En Railway Dashboard → Settings del servicio `backend`:
- **Root Directory**: `backend`

### 4. Configurar Build Settings

Railway detectará automáticamente Node.js, pero verifica:
- **Build Command**: `npm install` (o se ejecuta automáticamente)
- **Start Command**: `npm start`

### 5. Ejecutar Migraciones

Después del primer deploy:

```bash
# Opción 1: Desde Railway CLI
railway run npm run migrate

# Opción 2: Desde Railway Dashboard
# Settings → Deploy → Add Deploy Hook
# Command: npm run migrate
```

### 6. Generar Dominio

En Railway Dashboard → Settings → Generate Domain

---

## 🔗 Información de PostgreSQL

**DATABASE_URL**: Ya configurada automáticamente
**Servicio**: Postgres
**Variables disponibles**: Ver Railway Dashboard

---

## ✅ Checklist

- [ ] Servicio backend creado
- [ ] Variables de entorno configuradas
- [ ] Root directory configurado a `backend`
- [ ] Deploy exitoso
- [ ] Migraciones ejecutadas
- [ ] Dominio generado
- [ ] Health check funcionando

---

## 🚀 Comandos Útiles

```bash
# Ver logs
railway logs

# Ejecutar comando
railway run npm run migrate

# Ver variables
railway variables

# Ver servicios
railway service
```

---

¡Listo para continuar con el deploy! 🎉


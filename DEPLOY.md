# 🚀 Guía de Deploy - Mises Wallet

## Arquitectura de Deploy

- **Railway**: Backend + Base de datos PostgreSQL
- **Vercel**: Frontend (React + Vite)

---

## 📋 Paso 1: Railway - Backend + Base de Datos

### 1.1 Autenticación

```bash
railway login
```

### 1.2 Crear Proyecto Nuevo

```bash
# Desde la raíz del proyecto
railway init --name mises-wallet-backend
```

O usar el MCP:
- El proyecto se creará automáticamente cuando ejecutes el deploy

### 1.3 Agregar Base de Datos PostgreSQL

En Railway Dashboard:
1. Click en "New" → "Database" → "PostgreSQL"
2. Se creará automáticamente y tendrás las variables:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`
   - `DATABASE_URL` (connection string completo)

### 1.4 Configurar Variables de Entorno

En Railway Dashboard → Variables, agregar:

```env
# Base de datos (se genera automáticamente con PostgreSQL service)
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

### 1.5 Configurar Build y Deploy

Railway detectará automáticamente:
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

Si necesitas ajustar, edita `railway.json` en la raíz.

### 1.6 Ejecutar Migraciones

Después del primer deploy, ejecutar migraciones:

```bash
# Opción 1: Desde Railway CLI
railway run npm run migrate

# Opción 2: Desde Railway Dashboard
# Settings → Deploy → Add Deploy Hook
# Command: npm run migrate
```

### 1.7 Deploy

```bash
# Desde la raíz del proyecto
railway up
```

O conecta tu repositorio Git en Railway Dashboard para deploy automático.

---

## 📋 Paso 2: Vercel - Frontend

### 2.1 Instalar Vercel CLI

```bash
npm i -g vercel
```

### 2.2 Autenticación

```bash
vercel login
```

### 2.3 Crear Proyecto Nuevo

```bash
# Desde la raíz del proyecto
vercel --name mises-wallet-frontend
```

Seguir las instrucciones:
- **Set up and deploy?** → Yes
- **Which scope?** → Tu cuenta
- **Link to existing project?** → No
- **What's your project's name?** → mises-wallet-frontend
- **In which directory is your code located?** → `./frontend`

### 2.4 Configurar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://tu-backend.railway.app
```

**Importante**: Reemplazar `tu-backend.railway.app` con la URL real de tu backend en Railway.

### 2.5 Configurar Build Settings

Vercel detectará automáticamente Vite, pero verifica en Settings → General:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.6 Deploy

```bash
# Deploy a producción
vercel --prod

# O desde Vercel Dashboard, hacer push a tu branch main/master
```

---

## 🔗 Conectar Frontend con Backend

### Actualizar API URL en Frontend

1. En Vercel Dashboard → Environment Variables:
   - `VITE_API_URL=https://tu-backend.railway.app`

2. O crear archivo `.env.production` en `frontend/`:
   ```env
   VITE_API_URL=https://tu-backend.railway.app
   ```

### Configurar CORS en Backend

En Railway → Variables de entorno del backend, asegúrate de tener:

```env
CORS_ORIGIN=https://tu-frontend.vercel.app
```

Y en `backend/src/index.js`, verificar que CORS esté configurado correctamente.

---

## ✅ Checklist Post-Deploy

### Backend (Railway)
- [ ] Backend desplegado y corriendo
- [ ] Base de datos PostgreSQL creada
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Health check funcionando
- [ ] CORS configurado para el dominio del frontend

### Frontend (Vercel)
- [ ] Frontend desplegado
- [ ] Variable `VITE_API_URL` configurada
- [ ] Build exitoso
- [ ] Frontend puede comunicarse con backend

### General
- [ ] Probar login/registro
- [ ] Probar funcionalidades principales
- [ ] Verificar que las imágenes se cargan correctamente
- [ ] Verificar emails (si están configurados)

---

## 🔧 Troubleshooting

### Backend no inicia en Railway

1. Verificar logs: `railway logs`
2. Verificar que `PORT` esté configurado (Railway lo inyecta automáticamente)
3. Verificar que todas las variables de entorno estén configuradas

### Frontend no se conecta al backend

1. Verificar `VITE_API_URL` en Vercel
2. Verificar CORS en backend
3. Verificar que el backend esté accesible públicamente

### Migraciones no se ejecutan

1. Ejecutar manualmente: `railway run npm run migrate`
2. Verificar `DATABASE_URL` esté correcta
3. Verificar permisos de la base de datos

---

## 📝 Notas Importantes

1. **Base de datos**: Railway crea automáticamente las variables de conexión
2. **Volúmenes**: Las imágenes se guardan en el volumen persistente de Railway
3. **Dominios**: Railway y Vercel proporcionan dominios gratuitos
4. **SSL**: Ambos servicios proporcionan SSL automático
5. **Escalado**: Railway y Vercel escalan automáticamente

---

## 🚀 Comandos Rápidos

```bash
# Railway - Ver logs
railway logs

# Railway - Ejecutar comando
railway run npm run migrate

# Railway - Ver variables
railway variables

# Vercel - Deploy
vercel --prod

# Vercel - Ver logs
vercel logs
```

---

¡Listo para producción! 🎉


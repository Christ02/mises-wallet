# 🔐 Variables de Entorno para Railway - Mises Wallet Backend

## ⚠️ IMPORTANTE: Configurar Root Directory Primero

Antes de configurar variables, asegúrate de que en Railway Dashboard:
- Settings → Service → **Root Directory**: `backend`

---

## 📋 Variables a Configurar en Railway Dashboard

Ve a: https://railway.com/project/24fa5fe6-ee5d-49cc-b9bb-a8bcba57dbf7
→ Servicio `mises-wallet` → Variables

### 1. Base de Datos (CRÍTICO)

```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
```

**Nota**: Usa el formato `${{Postgres.DATABASE_URL}}` para referenciar la variable del servicio Postgres.

### 2. Node.js Básicas

```
NODE_ENV = production
PORT = 3000
```

### 3. JWT (CRÍTICO - Cambiar en producción)

```
JWT_SECRET = [GENERAR UN SECRET SEGURO DE AL MENOS 32 CARACTERES]
```

**Generar secret seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Encriptación (CRÍTICO - Cambiar en producción)

```
ENCRYPTION_KEY = [GENERAR UNA KEY DE EXACTAMENTE 32 CARACTERES]
```

**Generar encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Sepolia Testnet

```
SEPOLIA_RPC_URL = https://sepolia.infura.io/v3/TU_API_KEY_AQUI
```

O usa otro proveedor de RPC para Sepolia.

### 6. Frontend URL (Actualizar cuando tengas Vercel)

```
FRONTEND_URL = https://tu-frontend.vercel.app
CORS_ORIGIN = https://tu-frontend.vercel.app
```

**Temporalmente puedes usar:**
```
FRONTEND_URL = http://localhost:5174
CORS_ORIGIN = http://localhost:5174
```

Y actualizar cuando tengas el dominio de Vercel.

### 7. Email Configuration

#### Opción A: Resend (Producción)

```
EMAIL_PROVIDER = resend
RESEND_API_KEY = re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL = noreply@tu-dominio.com
```

#### Opción B: Mailtrap (Testing)

```
EMAIL_PROVIDER = mailtrap
SMTP_HOST = sandbox.smtp.mailtrap.io
SMTP_PORT = 2525
SMTP_SECURE = false
SMTP_USER = tu-mailtrap-user
SMTP_PASS = tu-mailtrap-pass
SMTP_FROM_EMAIL = noreply@tu-dominio.com
SMTP_FROM_NAME = Mises Wallet
```

### 8. Central Wallet (Si aplica)

```
CENTRAL_WALLET_ADDRESS = 0x...
CENTRAL_WALLET_PRIVATE_KEY = [PRIVATE KEY ENCRIPTADA]
```

### 9. Currency Rate

```
CURRENCY_RATE_GTQ = 1
```

---

## ✅ Checklist de Variables

- [ ] `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`
- [ ] `JWT_SECRET` = [generado]
- [ ] `ENCRYPTION_KEY` = [generado]
- [ ] `SEPOLIA_RPC_URL` = [tu RPC URL]
- [ ] `FRONTEND_URL` = [URL de Vercel o temporal]
- [ ] `CORS_ORIGIN` = [URL de Vercel o temporal]
- [ ] `EMAIL_PROVIDER` = `resend` o `mailtrap`
- [ ] Variables de email configuradas según el proveedor elegido

---

## 🔧 Cómo Configurar en Railway Dashboard

1. Ve a tu proyecto: https://railway.com/project/24fa5fe6-ee5d-49cc-b9bb-a8bcba57dbf7
2. Click en el servicio `mises-wallet`
3. Ve a la pestaña **Variables**
4. Click en **+ New Variable**
5. Agrega cada variable con su valor
6. Para `DATABASE_URL`, usa: `${{Postgres.DATABASE_URL}}`

---

## 🚨 Variables Críticas que DEBEN Cambiarse

Estas NO deben usar valores por defecto en producción:

1. **JWT_SECRET** - Debe ser único y seguro
2. **ENCRYPTION_KEY** - Debe ser único y seguro
3. **SEPOLIA_RPC_URL** - Debe tener tu API key real
4. **RESEND_API_KEY** o credenciales SMTP - Deben ser reales

---

## 📝 Notas

- Las variables se aplican inmediatamente después de guardar
- No necesitas redeploy para aplicar variables (solo para cambios de código)
- `DATABASE_URL` se conecta automáticamente al servicio Postgres
- Railway inyecta `PORT` automáticamente, pero es bueno configurarlo explícitamente

---

¡Configura estas variables y el servicio debería funcionar! 🎉


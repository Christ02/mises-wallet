# 🔧 Configurar Root Directory en Vercel

## ⚠️ Problema Actual

Vercel está intentando hacer el build desde la raíz del proyecto, pero el código del frontend está en `frontend/`. Por eso sale el error 404.

## ✅ Solución: Configurar Root Directory

### Pasos en Vercel Dashboard:

1. **Ve a tu proyecto en Vercel:**
   - https://vercel.com/christians-projects-630693d2/mises-wallet
   - O busca "mises-wallet" en tu dashboard

2. **Configura Root Directory:**
   - Click en **Settings** (Configuración)
   - Ve a la sección **General**
   - Busca **Root Directory**
   - Click en **Edit**
   - Escribe: `frontend`
   - Click en **Save**

3. **Redeploy:**
   - Vercel detectará el cambio automáticamente
   - Hará un nuevo deploy
   - O puedes hacer click en **Deployments** → **Redeploy**

## 📋 Qué Hace Esto

Al configurar Root Directory a `frontend`:
- ✅ Vercel ejecutará `npm install` en `frontend/`
- ✅ Vercel ejecutará `npm run build` en `frontend/`
- ✅ Vercel servirá los archivos desde `frontend/dist/`
- ✅ El build funcionará correctamente

## ✅ Después del Redeploy

1. El build debería completarse exitosamente
2. La página debería cargar correctamente
3. El frontend se conectará al backend de Railway

---

**Este es el paso crítico para que Vercel funcione correctamente.**


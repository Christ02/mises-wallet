# 🔧 Fix para Error 404 en Vercel

## ❌ Problema

El error 404 indica que Vercel no está encontrando los archivos del build. Esto sucede porque Vercel está intentando hacer el build desde la raíz del proyecto en lugar del directorio `frontend/`.

## ✅ Solución

### Opción 1: Configurar Root Directory en Vercel Dashboard (RECOMENDADO)

1. Ve a: https://vercel.com/christians-projects-630693d2/mises-wallet
2. Click en **Settings** → **General**
3. En **Root Directory**, escribe: `frontend`
4. Guarda los cambios
5. Vercel hará redeploy automáticamente

### Opción 2: Deploy desde el directorio frontend

Si prefieres hacerlo desde la CLI:

```bash
cd frontend
vercel --prod
```

## 📋 Configuración Actual

- ✅ `vercel.json` en la raíz (para cuando Root Directory esté configurado)
- ✅ `frontend/vercel.json` (alternativa)
- ✅ Variable `VITE_API_URL` configurada

## 🔄 Después de Configurar Root Directory

1. Vercel detectará automáticamente Vite
2. Ejecutará `npm install` en `frontend/`
3. Ejecutará `npm run build`
4. Servirá los archivos desde `frontend/dist/`

## ✅ Verificación

Después del redeploy, verifica:
- ✅ El build se completa exitosamente
- ✅ La página carga correctamente
- ✅ No hay errores 404
- ✅ El frontend se conecta al backend de Railway

---

**La solución más rápida es configurar Root Directory a `frontend` en Vercel Dashboard.**

